import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { User } from "@prisma/client";
import {
	type Profile,
	Strategy,
	type VerifyCallback,
} from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import type { GoogleUser } from "../interfaces/google-user.interface";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
	constructor(
		config: ConfigService,
		private readonly authService: AuthService,
	) {
		super({
			clientID: config.getOrThrow<string>("GOOGLE_CLIENT_ID"),
			clientSecret: config.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
			callbackURL: config.getOrThrow<string>("GOOGLE_CALLBACK_URL"),
			scope: ["email", "profile", "https://www.googleapis.com/auth/drive.file"],
		});
	}

	// Offline access + forced consent → Google siempre devuelve refresh_token (necesario para Drive)
	override authorizationParams(): Record<string, string> {
		return { access_type: "offline", prompt: "consent" };
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: VerifyCallback,
	): Promise<void> {
		const email = profile.emails?.[0]?.value;

		if (!email) {
			done(new Error("No se pudo obtener el correo electrónico desde Google"));
			return;
		}

		const googleUser: GoogleUser = {
			googleId: profile.id,
			email,
			name: profile.displayName,
			picture: profile.photos?.[0]?.value ?? null,
			accessToken,
			refreshToken: refreshToken ?? null,
		};

		try {
			const user: User = await this.authService.validateGoogleUser(googleUser);
			done(null, user);
		} catch (error) {
			done(error as Error);
		}
	}
}
