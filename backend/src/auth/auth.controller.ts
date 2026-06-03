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
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Iniciar autenticación con Google',
    description: 'Redirige al usuario al flujo de consentimiento de Google OAuth 2.0.',
  })
  googleAuth(): void {
    // El guard redirige a Google — este handler nunca se ejecuta directamente
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiExcludeEndpoint()
  async googleAuthCallback(
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } = this.authService.generateTokens(user.id, user.email);
    const frontendUrl = this.config.get<string>('CORS_ORIGIN', 'http://localhost:5173');
    res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar access token',
    description: 'Emite un nuevo access token a partir de un refresh token válido.',
  })
  @ApiOkResponse({ schema: { properties: { accessToken: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido o expirado' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.refreshAccessToken(dto.refreshToken);
    return { accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Devuelve los datos del usuario a partir del JWT en el header Authorization.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado' })
  me(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.from(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'El cliente debe descartar los tokens. Los JWT son stateless — no se invalidan en servidor.',
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  logout(): void {
    // Los JWT son stateless. La invalidación real se maneja en el cliente.
    // Fase futura: agregar blacklist si se requiere revocación inmediata.
  }
}
