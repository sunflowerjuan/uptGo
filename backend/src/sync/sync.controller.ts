import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SyncCompleteDto } from './dto/sync-complete.dto';
import { SyncResponseDto } from './dto/sync-response.dto';
import { SyncService } from './sync.service';

@ApiTags('Sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener estado de sincronización',
    description:
      'Devuelve los metadatos de sincronización del usuario: estado actual, versión y fecha de última sincronización. ' +
      'Crea el registro con valores iniciales si aún no existe.',
  })
  @ApiOkResponse({ type: SyncResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido o expirado',
  })
  getSync(@CurrentUser() user: User): Promise<SyncResponseDto> {
    return this.syncService.getSync(user.id);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sincronización',
    description:
      'Marca la sincronización como IN_PROGRESS. El cliente llama a este endpoint justo antes ' +
      'de comenzar el backup de datos hacia Google Drive. Falla si ya hay una sincronización en curso.',
  })
  @ApiOkResponse({ type: SyncResponseDto })
  @ApiConflictResponse({ description: 'Ya hay una sincronización en progreso' })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido o expirado',
  })
  startSync(@CurrentUser() user: User): Promise<SyncResponseDto> {
    return this.syncService.startSync(user.id);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar sincronización',
    description:
      'Marca la sincronización como COMPLETED, actualiza lastSyncAt e incrementa syncVersion. ' +
      'Envía una notificación push al usuario si tiene activado el tipo "sync" en preferencias.',
  })
  @ApiOkResponse({ type: SyncResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido o expirado',
  })
  completeSync(
    @CurrentUser() user: User,
    @Body() dto: SyncCompleteDto,
  ): Promise<SyncResponseDto> {
    return this.syncService.completeSync(user.id, dto);
  }

  @Post('fail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reportar fallo de sincronización',
    description:
      'Marca la sincronización como FAILED. El cliente llama a este endpoint cuando el proceso ' +
      'de backup a Google Drive falla. Se puede reintentar llamando a POST /api/sync/start.',
  })
  @ApiOkResponse({ type: SyncResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido o expirado',
  })
  failSync(@CurrentUser() user: User): Promise<SyncResponseDto> {
    return this.syncService.failSync(user.id);
  }
}
