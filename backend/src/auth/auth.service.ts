import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AuthProvider, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleUser } from './interfaces/google-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

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
      where: { userId_provider: { userId: user.id, provider: AuthProvider.GOOGLE } },
      create: {
        userId: user.id,
        provider: AuthProvider.GOOGLE,
        accessToken: googleUser.accessToken,
        refreshToken: googleUser.refreshToken,
        expiresAt: new Date(Date.now() + 3_600_000),
      },
      update: {
        accessToken: googleUser.accessToken,
        ...(googleUser.refreshToken && { refreshToken: googleUser.refreshToken }),
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });

    return user;
  }

  generateTokens(userId: string, email: string): TokenPair {
    const payload: JwtPayload = { sub: userId, email };
    const expiresInStr = this.config.get<string>('JWT_EXPIRES_IN', '15m');

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as StringValue,
    });

    return { accessToken, refreshToken, expiresIn: this.parseDurationToSeconds(expiresInStr) };
  }

  async refreshAccessToken(rawRefreshToken: string): Promise<string> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return this.jwtService.sign({ sub: user.id, email: user.email } satisfies JwtPayload);
  }

  private buildInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  private parseDurationToSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) return 900;
    const value = parseInt(match[1], 10);
    const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (map[match[2]] ?? 60);
  }
}
