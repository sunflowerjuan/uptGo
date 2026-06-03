import { ConflictException, Injectable } from '@nestjs/common';
import { SyncStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { SyncCompleteDto } from './dto/sync-complete.dto';
import { SyncResponseDto } from './dto/sync-response.dto';

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async getSync(userId: string): Promise<SyncResponseDto> {
    const sync = await this.prisma.syncMetadata.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return SyncResponseDto.from(sync);
  }

  async startSync(userId: string): Promise<SyncResponseDto> {
    const current = await this.getSync(userId);

    if (current.syncStatus === SyncStatus.IN_PROGRESS) {
      throw new ConflictException('Ya hay una sincronización en progreso');
    }

    const sync = await this.prisma.syncMetadata.update({
      where: { userId },
      data: { syncStatus: SyncStatus.IN_PROGRESS },
    });

    return SyncResponseDto.from(sync);
  }

  async completeSync(userId: string, dto: SyncCompleteDto): Promise<SyncResponseDto> {
    const sync = await this.prisma.syncMetadata.update({
      where: { userId },
      data: {
        syncStatus: SyncStatus.COMPLETED,
        lastSyncAt: new Date(),
        syncVersion: { increment: 1 },
      },
    });

    const body =
      dto.itemCount !== undefined && dto.itemCount > 0
        ? `${dto.itemCount} cambio${dto.itemCount === 1 ? '' : 's'} offline se guardaron en la nube.`
        : 'Todos tus datos están sincronizados.';

    await this.notifications.sendToUser(userId, {
      type: 'sync',
      title: 'Sincronización completada',
      body,
      data: { syncVersion: sync.syncVersion },
    });

    return SyncResponseDto.from(sync);
  }

  async failSync(userId: string): Promise<SyncResponseDto> {
    const sync = await this.prisma.syncMetadata.update({
      where: { userId },
      data: { syncStatus: SyncStatus.FAILED },
    });

    return SyncResponseDto.from(sync);
  }
}
