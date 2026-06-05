import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class SyncCompleteDto {
  @ApiPropertyOptional({
    description: 'Cantidad de ítems sincronizados con Google Drive (para el mensaje de la notificación push)',
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  itemCount?: number;
}
