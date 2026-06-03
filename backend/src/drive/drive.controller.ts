import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
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
import { DriveFileResponseDto } from './dto/drive-file-response.dto';
import { DriveFolderResponseDto } from './dto/drive-folder-response.dto';
import { UploadBackupDto } from './dto/upload-backup.dto';
import { DriveService } from './drive.service';

@ApiTags('Drive')
@Controller('drive')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado' })
@ApiForbiddenResponse({ description: 'No hay tokens de Google Drive — el usuario debe re-autenticarse' })
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @Get('folder')
  @ApiOperation({
    summary: 'Obtener o crear la carpeta UPTGO en Google Drive',
    description:
      'Busca la carpeta "UPTGO Backup" en el Drive del usuario. Si no existe, la crea automáticamente. ' +
      'El ID de la carpeta se cachea en la base de datos para evitar búsquedas repetidas.',
  })
  @ApiOkResponse({ type: DriveFolderResponseDto })
  getOrCreateFolder(@CurrentUser() user: User): Promise<DriveFolderResponseDto> {
    return this.driveService.getOrCreateFolder(user.id);
  }

  @Get('backups')
  @ApiOperation({
    summary: 'Listar archivos de backup en Google Drive',
    description: 'Devuelve todos los backups almacenados en la carpeta UPTGO del usuario, ordenados por fecha de modificación.',
  })
  @ApiOkResponse({ type: [DriveFileResponseDto] })
  listBackups(@CurrentUser() user: User): Promise<DriveFileResponseDto[]> {
    return this.driveService.listBackups(user.id);
  }

  @Post('backups')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Subir backup a Google Drive',
    description:
      'Recibe el contenido del backup exportado desde IndexedDB y lo sube como archivo JSON ' +
      'a la carpeta UPTGO del usuario en Google Drive. El servidor no almacena el contenido.',
  })
  @ApiCreatedResponse({ type: DriveFileResponseDto })
  uploadBackup(
    @CurrentUser() user: User,
    @Body() dto: UploadBackupDto,
  ): Promise<DriveFileResponseDto> {
    return this.driveService.uploadBackup(user.id, dto);
  }

  @Get('backups/:fileId')
  @ApiOperation({
    summary: 'Obtener metadatos de un archivo de backup',
    description: 'Devuelve los metadatos del archivo (nombre, tamaño, fechas). No descarga el contenido.',
  })
  @ApiOkResponse({ type: DriveFileResponseDto })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado en Google Drive' })
  getBackup(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string,
  ): Promise<DriveFileResponseDto> {
    return this.driveService.getBackup(user.id, fileId);
  }

  @Delete('backups/:fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un archivo de backup de Google Drive',
    description: 'Mueve el archivo a la papelera del Drive del usuario.',
  })
  @ApiNoContentResponse({ description: 'Archivo eliminado' })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado en Google Drive' })
  deleteBackup(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string,
  ): Promise<void> {
    return this.driveService.deleteBackup(user.id, fileId);
  }
}
