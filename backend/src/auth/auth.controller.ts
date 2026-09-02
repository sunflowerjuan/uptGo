import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import type { Response } from 'express';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { WebAuthnLoginBeginDto } from './dto/webauthn-login-begin.dto';
import { WebAuthnLoginCompleteDto } from './dto/webauthn-login-complete.dto';
import { WebAuthnRegisterCompleteDto } from './dto/webauthn-register-complete.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // ─── Email / Contraseña ───────────────────────────────────────────────────────

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar cuenta con email y contraseña',
    description:
      'Crea una nueva cuenta de usuario. La contraseña se hashea con Argon2id antes de almacenarse.',
  })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({
    description: 'El correo electrónico ya está registrado',
  })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión con email y contraseña',
    description:
      'Verifica las credenciales con Argon2id y emite un par de JWT (access + refresh).',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Iniciar autenticación con Google',
    description:
      'Redirige al usuario al flujo de consentimiento de Google OAuth 2.0 (incluye scope de Google Drive).',
  })
  googleAuth(): void {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiExcludeEndpoint()
  googleAuthCallback(@CurrentUser() user: User, @Res() res: Response): void {
    const { accessToken, refreshToken } = this.authService.generateTokens(
      user.id,
      user.email,
    );
    const frontendUrl = this.config.get<string>(
      'CORS_ORIGIN',
      'http://localhost:5173',
    );
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }

  // ─── JWT Refresh / Profile ────────────────────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token con refresh token' })
  @ApiOkResponse({
    schema: { properties: { accessToken: { type: 'string' } } },
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido o expirado' })
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.refreshAccessToken(
      dto.refreshToken,
    );
    return { accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido o expirado',
  })
  me(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.from(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cerrar sesión (el cliente descarta los tokens)' })
  logout(): void {}

  // ─── WebAuthn ────────────────────────────────────────────────────────────────

  @Post('webauthn/register/begin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar registro de credencial WebAuthn',
    description:
      'Genera las opciones para llamar a navigator.credentials.create(). ' +
      'Requiere estar autenticado — el usuario añade biometría a su cuenta existente.',
  })
  @ApiOkResponse({ type: ChallengeResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido o expirado',
  })
  webAuthnRegisterBegin(
    @CurrentUser() user: User,
  ): Promise<ChallengeResponseDto> {
    return this.authService.webAuthnRegisterBegin(user.id, user.email);
  }

  @Post('webauthn/register/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Completar registro de credencial WebAuthn',
    description:
      'Verifica la respuesta de navigator.credentials.create() y almacena la clave pública del dispositivo.',
  })
  @ApiUnauthorizedResponse({
    description: 'Challenge inválido o credencial no verificada',
  })
  async webAuthnRegisterComplete(
    @CurrentUser() user: User,
    @Body() dto: WebAuthnRegisterCompleteDto,
  ): Promise<void> {
    await this.authService.webAuthnRegisterComplete(user.id, dto);
  }

  @Post('webauthn/login/begin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar autenticación WebAuthn (biometría)',
    description:
      'Genera las opciones para llamar a navigator.credentials.get(). No requiere autenticación previa.',
  })
  @ApiOkResponse({ type: ChallengeResponseDto })
  webAuthnLoginBegin(
    @Body() dto: WebAuthnLoginBeginDto,
  ): Promise<ChallengeResponseDto> {
    return this.authService.webAuthnLoginBegin(dto.email);
  }

  @Post('webauthn/login/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar autenticación WebAuthn',
    description:
      'Verifica la firma biométrica y emite un par de JWT. Actualiza el contador anti-replay.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Credencial no reconocida o verificación fallida',
  })
  webAuthnLoginComplete(
    @Body() dto: WebAuthnLoginCompleteDto,
  ): Promise<AuthResponseDto> {
    return this.authService.webAuthnLoginComplete(dto);
  }
}
