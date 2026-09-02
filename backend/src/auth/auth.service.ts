import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthProvider, type User } from "@prisma/client";
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type {
	AuthenticationResponseJSON,
	RegistrationResponseJSON,
} from "@simplewebauthn/types";
import * as argon2 from "argon2";
import type { StringValue } from "ms";
import { PrismaService } from "../prisma/prisma.service";
import { UserResponseDto } from "../users/dto/user-response.dto";
import type { AuthResponseDto } from "./dto/auth-response.dto";
import type { ChallengeResponseDto } from "./dto/challenge-response.dto";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";
import type { WebAuthnLoginCompleteDto } from "./dto/webauthn-login-complete.dto";
import type { WebAuthnRegisterCompleteDto } from "./dto/webauthn-register-complete.dto";
import type { GoogleUser } from "./interfaces/google-user.interface";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

interface ChallengeJwtPayload {
	sub: string;
	challenge: string;
	type: "reg" | "auth";
}

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly config: ConfigService,
	) {}

	// ─── Google OAuth ─────────────────────────────────────────────────────────────

	async validateGoogleUser(googleUser: GoogleUser): Promise<User> {
		let user = await this.prisma.user.findFirst({
			where: { email: googleUser.email, deletedAt: null },
		});

		if (!user) {
			user = await this.prisma.user.create({
				data: {
					email: googleUser.email,
					name: googleUser.name,
					provider: AuthProvider.GOOGLE,
					initials: this.buildInitials(googleUser.name),
					profileData: googleUser.picture
						? { picture: googleUser.picture }
						: undefined,
				},
			});
		}

		await this.prisma.oAuthToken.upsert({
			where: {
				userId_provider: { userId: user.id, provider: AuthProvider.GOOGLE },
			},
			create: {
				userId: user.id,
				provider: AuthProvider.GOOGLE,
				accessToken: googleUser.accessToken,
				refreshToken: googleUser.refreshToken,
				expiresAt: new Date(Date.now() + 3_600_000),
			},
			update: {
				accessToken: googleUser.accessToken,
				...(googleUser.refreshToken && {
					refreshToken: googleUser.refreshToken,
				}),
				expiresAt: new Date(Date.now() + 3_600_000),
			},
		});

		return user;
	}

	// ─── Email / Contraseña ───────────────────────────────────────────────────────

	async register(dto: RegisterDto): Promise<AuthResponseDto> {
		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existing) {
			throw new ConflictException("El correo electrónico ya está registrado");
		}

		const passwordHash = await argon2.hash(dto.password);

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				name: dto.name,
				passwordHash,
				provider: AuthProvider.LOCAL,
				initials: this.buildInitials(dto.name),
				program: dto.program,
				semester: dto.semester,
			},
		});

		return this.buildAuthResponse(user);
	}

	async login(dto: LoginDto): Promise<AuthResponseDto> {
		const user = await this.prisma.user.findFirst({
			where: { email: dto.email, deletedAt: null },
		});

		if (!user || !user.passwordHash) {
			throw new UnauthorizedException("Credenciales inválidas");
		}

		const passwordValid = await argon2.verify(user.passwordHash, dto.password);

		if (!passwordValid) {
			throw new UnauthorizedException("Credenciales inválidas");
		}

		return this.buildAuthResponse(user);
	}

	// ─── WebAuthn ────────────────────────────────────────────────────────────────

	async webAuthnRegisterBegin(
		userId: string,
		email: string,
	): Promise<ChallengeResponseDto> {
		const existingCredentials = await this.prisma.webAuthnCredential.findMany({
			where: { userId },
		});

		const options = await generateRegistrationOptions({
			rpName: this.config.getOrThrow<string>("WEBAUTHN_RP_NAME"),
			rpID: this.config.getOrThrow<string>("WEBAUTHN_RP_ID"),
			userName: email,
			userDisplayName: email,
			attestationType: "none",
			authenticatorSelection: {
				residentKey: "preferred",
				userVerification: "preferred",
			},
			excludeCredentials: existingCredentials.map((c) => ({
				id: c.credentialId,
				type: "public-key" as const,
			})),
		});

		const challengeToken = this.jwtService.sign(
			{
				sub: userId,
				challenge: options.challenge,
				type: "reg",
			} satisfies ChallengeJwtPayload,
			{ expiresIn: "5m" as StringValue },
		);

		return {
			challengeToken,
			options: options as unknown as Record<string, unknown>,
		};
	}

	async webAuthnRegisterComplete(
		userId: string,
		dto: WebAuthnRegisterCompleteDto,
	): Promise<void> {
		let challengePayload: ChallengeJwtPayload;

		try {
			challengePayload = this.jwtService.verify<ChallengeJwtPayload>(
				dto.challengeToken,
			);
		} catch {
			throw new UnauthorizedException("Challenge token inválido o expirado");
		}

		if (challengePayload.sub !== userId || challengePayload.type !== "reg") {
			throw new UnauthorizedException(
				"Challenge token no corresponde a este usuario",
			);
		}

		const verification = await verifyRegistrationResponse({
			response: dto.credential as unknown as RegistrationResponseJSON,
			expectedChallenge: challengePayload.challenge,
			expectedOrigin: this.config.getOrThrow<string>("WEBAUTHN_ORIGIN"),
			expectedRPID: this.config.getOrThrow<string>("WEBAUTHN_RP_ID"),
		});

		if (!verification.verified || !verification.registrationInfo) {
			throw new UnauthorizedException(
				"La verificación de la credencial WebAuthn falló",
			);
		}

		const { credential, credentialDeviceType, credentialBackedUp } =
			verification.registrationInfo;

		await this.prisma.webAuthnCredential.create({
			data: {
				userId,
				credentialId: credential.id,
				publicKey: isoBase64URL.fromBuffer(credential.publicKey),
				counter: credential.counter,
				deviceType: credentialDeviceType,
				backedUp: credentialBackedUp,
				transports: (dto.credential["response"] as
					| Record<string, unknown>
					| undefined)
					? (((dto.credential["response"] as Record<string, unknown>)[
							"transports"
						] as string[] | undefined) ?? [])
					: [],
			},
		});
	}

	async webAuthnLoginBegin(email: string): Promise<ChallengeResponseDto> {
		const user = await this.prisma.user.findFirst({
			where: { email, deletedAt: null },
		});

		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		const credentials = await this.prisma.webAuthnCredential.findMany({
			where: { userId: user.id },
		});

		const options = await generateAuthenticationOptions({
			rpID: this.config.getOrThrow<string>("WEBAUTHN_RP_ID"),
			allowCredentials: credentials.map((c) => ({
				id: c.credentialId,
				type: "public-key" as const,
			})),
			userVerification: "preferred",
		});

		const challengeToken = this.jwtService.sign(
			{
				sub: email,
				challenge: options.challenge,
				type: "auth",
			} satisfies ChallengeJwtPayload,
			{ expiresIn: "5m" as StringValue },
		);

		return {
			challengeToken,
			options: options as unknown as Record<string, unknown>,
		};
	}

	async webAuthnLoginComplete(
		dto: WebAuthnLoginCompleteDto,
	): Promise<AuthResponseDto> {
		let challengePayload: ChallengeJwtPayload;

		try {
			challengePayload = this.jwtService.verify<ChallengeJwtPayload>(
				dto.challengeToken,
			);
		} catch {
			throw new UnauthorizedException("Challenge token inválido o expirado");
		}

		if (
			challengePayload.sub !== dto.email ||
			challengePayload.type !== "auth"
		) {
			throw new UnauthorizedException(
				"Challenge token no corresponde a este email",
			);
		}

		const user = await this.prisma.user.findFirst({
			where: { email: dto.email, deletedAt: null },
		});

		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		const credentialResponse =
			dto.credential as unknown as AuthenticationResponseJSON;
		const storedCredential = await this.prisma.webAuthnCredential.findUnique({
			where: { credentialId: credentialResponse.id },
		});

		if (!storedCredential || storedCredential.userId !== user.id) {
			throw new UnauthorizedException("Credencial no reconocida");
		}

		const verification = await verifyAuthenticationResponse({
			response: credentialResponse,
			expectedChallenge: challengePayload.challenge,
			expectedOrigin: this.config.getOrThrow<string>("WEBAUTHN_ORIGIN"),
			expectedRPID: this.config.getOrThrow<string>("WEBAUTHN_RP_ID"),
			credential: {
				id: storedCredential.credentialId,
				publicKey: isoBase64URL.toBuffer(storedCredential.publicKey),
				counter: storedCredential.counter,
				transports: storedCredential.transports as AuthenticatorTransport[],
			},
		});

		if (!verification.verified) {
			throw new UnauthorizedException(
				"La verificación de la autenticación WebAuthn falló",
			);
		}

		const { newCounter } = verification.authenticationInfo;

		if (newCounter !== undefined) {
			await this.prisma.webAuthnCredential.update({
				where: { id: storedCredential.id },
				data: { counter: newCounter },
			});
		}

		return this.buildAuthResponse(user);
	}

	// ─── JWT helpers ──────────────────────────────────────────────────────────────

	generateTokens(userId: string, email: string): TokenPair {
		const payload: JwtPayload = { sub: userId, email };
		const expiresInStr = this.config.get<string>("JWT_EXPIRES_IN", "15m");

		const accessToken = this.jwtService.sign(payload);

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
			expiresIn: this.config.get<string>(
				"JWT_REFRESH_EXPIRES_IN",
				"7d",
			) as StringValue,
		});

		return {
			accessToken,
			refreshToken,
			expiresIn: this.parseDurationToSeconds(expiresInStr),
		};
	}

	buildAuthResponse(user: User): AuthResponseDto {
		const { accessToken, refreshToken, expiresIn } = this.generateTokens(
			user.id,
			user.email,
		);
		return {
			accessToken,
			refreshToken,
			tokenType: "Bearer",
			expiresIn,
			user: UserResponseDto.from(user),
		};
	}

	async refreshAccessToken(rawRefreshToken: string): Promise<string> {
		let payload: JwtPayload;

		try {
			payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, {
				secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
			});
		} catch {
			throw new UnauthorizedException("Refresh token inválido o expirado");
		}

		const user = await this.prisma.user.findFirst({
			where: { id: payload.sub, deletedAt: null },
		});

		if (!user) {
			throw new UnauthorizedException("Usuario no encontrado");
		}

		return this.jwtService.sign({
			sub: user.id,
			email: user.email,
		} satisfies JwtPayload);
	}

	// ─── Private helpers ──────────────────────────────────────────────────────────

	private buildInitials(name: string): string {
		return name
			.split(" ")
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? "")
			.join("");
	}

	private parseDurationToSeconds(duration: string): number {
		const match = /^(\d+)([smhd])$/.exec(duration);
		if (!match) return 900;
		const value = parseInt(match[1], 10);
		const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
		return value * (map[match[2]] ?? 60);
	}
}
