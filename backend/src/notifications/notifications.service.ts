import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import type { NotificationKind, PushPayload } from './types/push-payload.type';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    webpush.setVapidDetails(
      this.config.getOrThrow<string>('VAPID_SUBJECT'),
      this.config.getOrThrow<string>('VAPID_PUBLIC_KEY'),
      this.config.getOrThrow<string>('VAPID_PRIVATE_KEY'),
    );
  }

  getVapidPublicKey(): string {
    return this.config.getOrThrow<string>('VAPID_PUBLIC_KEY');
  }

  async subscribe(userId: string, dto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint: dto.endpoint },
    });

    if (existing) {
      if (existing.userId !== userId) {
        throw new ConflictException('Este endpoint ya está registrado por otro usuario');
      }
      return SubscriptionResponseDto.from(existing);
    }

    const sub = await this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.p256dh,
        auth: dto.auth,
        userAgent: dto.userAgent,
      },
    });

    return SubscriptionResponseDto.from(sub);
  }

  async findByUser(userId: string): Promise<SubscriptionResponseDto[]> {
    const subs = await this.prisma.pushSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return subs.map(SubscriptionResponseDto.from);
  }

  async remove(userId: string, subscriptionId: string): Promise<void> {
    const sub = await this.prisma.pushSubscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!sub) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    await this.prisma.pushSubscription.delete({ where: { id: subscriptionId } });
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const preferences = await this.settings.getNotificationPreferences(userId);

    if (!preferences[payload.type as NotificationKind]) {
      this.logger.debug(`Notificación tipo "${payload.type}" desactivada para usuario ${userId}`);
      return;
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) return;

    const serialized = JSON.stringify(payload);
    const staleIds: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            serialized,
          );
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            staleIds.push(sub.id);
          } else {
            this.logger.warn(`Error enviando push a ${sub.endpoint}: ${String(err)}`);
          }
        }
      }),
    );

    if (staleIds.length > 0) {
      await this.prisma.pushSubscription.deleteMany({ where: { id: { in: staleIds } } });
      this.logger.debug(`Eliminadas ${staleIds.length} suscripciones expiradas de usuario ${userId}`);
    }
  }
}
