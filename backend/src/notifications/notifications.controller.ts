import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SendTestNotificationDto } from './dto/send-test-notification.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('vapid-public-key')
  @ApiOperation({
    summary: 'Obtener VAPID public key',
    description:
      'Devuelve la clave pública VAPID necesaria para que el Service Worker ' +
      'registre la suscripción push en el navegador. No requiere autenticación.',
  })
  @ApiOkResponse({ schema: { properties: { publicKey: { type: 'string' } } } })
  getVapidPublicKey(): { publicKey: string } {
    return { publicKey: this.notificationsService.getVapidPublicKey() };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar suscripción push del dispositivo',
    description:
      'Recibe el objeto de suscripción generado por pushManager.subscribe() y lo almacena. ' +
      'Si el endpoint ya está registrado para este usuario, devuelve la suscripción existente.',
  })
  @ApiCreatedResponse({ type: SubscriptionResponseDto })
  @ApiConflictResponse({ description: 'Endpoint ya registrado por otro usuario' })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado' })
  subscribe(
    @CurrentUser() user: User,
    @Body() dto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.notificationsService.subscribe(user.id, dto);
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar suscripciones push del usuario autenticado' })
  @ApiOkResponse({ type: [SubscriptionResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado' })
  findMine(@CurrentUser() user: User): Promise<SubscriptionResponseDto[]> {
    return this.notificationsService.findByUser(user.id);
  }

  @Delete('subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar suscripción push',
    description: 'Desregistra el dispositivo. Útil para cerrar sesión o revocar notificaciones.',
  })
  @ApiNoContentResponse({ description: 'Suscripción eliminada' })
  @ApiNotFoundResponse({ description: 'Suscripción no encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado' })
  remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.notificationsService.remove(user.id, id);
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Enviar notificación de prueba',
    description:
      'Envía una notificación push de prueba al usuario autenticado en todos sus dispositivos registrados. ' +
      'Respeta las preferencias de notificación.',
  })
  @ApiNoContentResponse({ description: 'Notificación enviada (o ignorada por preferencias)' })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado' })
  async sendTest(
    @CurrentUser() user: User,
    @Body() dto: SendTestNotificationDto,
  ): Promise<void> {
    await this.notificationsService.sendToUser(user.id, {
      type: dto.type,
      title: dto.title,
      body: dto.body,
      data: dto.data,
    });
  }
}
