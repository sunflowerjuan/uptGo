import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SettingsResponseDto } from './dto/settings-response.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener configuración del usuario',
    description:
      'Devuelve las preferencias del usuario autenticado. Si no existen, las crea con valores predeterminados.',
  })
  @ApiOkResponse({ type: SettingsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado' })
  findMine(@CurrentUser() user: User): Promise<SettingsResponseDto> {
    return this.settingsService.findByUser(user.id);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar configuración del usuario',
    description:
      'Actualiza parcialmente las preferencias. Solo se modifican los campos enviados. ' +
      'En notificationPreferences, solo se sobrescriben las claves enviadas.',
  })
  @ApiOkResponse({ type: SettingsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado' })
  update(
    @CurrentUser() user: User,
    @Body() dto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.update(user.id, dto);
  }
}
