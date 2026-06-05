import { ApiProperty } from '@nestjs/swagger';

export class DriveFolderResponseDto {
  @ApiProperty({ description: 'ID de la carpeta en Google Drive', example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs' })
  folderId: string;

  @ApiProperty({ description: 'Nombre de la carpeta', example: 'UPTGO Backup' })
  folderName: string;
}
