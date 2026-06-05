import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString, Matches } from 'class-validator';

export class UploadBackupDto {
  @ApiProperty({
    description: 'Nombre del archivo de backup',
    example: 'uptgo-backup-2026-06-03T12-00-00.json',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\w\-. ]+\.json$/, { message: 'El nombre del archivo debe terminar en .json y no contener caracteres especiales' })
  fileName: string;

  @ApiPropertyOptional({
    description: 'Descripción del contenido del backup',
    example: 'Backup completo — tareas, notas, recordatorios',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Contenido del backup exportado desde IndexedDB (JSON serializable)',
    example: { tasks: [], notes: [], reminders: [], version: 1 },
  })
  @IsObject()
  content: Record<string, unknown>;
}
