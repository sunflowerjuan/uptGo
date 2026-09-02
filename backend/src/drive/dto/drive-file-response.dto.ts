import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { drive_v3 } from "googleapis";

export class DriveFileResponseDto {
	@ApiProperty({
		description: "ID del archivo en Google Drive",
		example: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
	})
	fileId: string;

	@ApiProperty({
		description: "Nombre del archivo",
		example: "uptgo-backup-2026-06-03.json",
	})
	name: string;

	@ApiProperty({
		description: "Tipo MIME del archivo",
		example: "application/json",
	})
	mimeType: string;

	@ApiPropertyOptional({
		description: "Tamaño del archivo en bytes (como string)",
		example: "48320",
		nullable: true,
	})
	size: string | null;

	@ApiPropertyOptional({
		description: "Fecha de creación en Google Drive",
		nullable: true,
	})
	createdAt: string | null;

	@ApiPropertyOptional({
		description: "Fecha de última modificación",
		nullable: true,
	})
	modifiedAt: string | null;

	static fromDriveFile(file: drive_v3.Schema$File): DriveFileResponseDto {
		const dto = new DriveFileResponseDto();
		dto.fileId = file.id ?? "";
		dto.name = file.name ?? "";
		dto.mimeType = file.mimeType ?? "application/octet-stream";
		dto.size = file.size ?? null;
		dto.createdAt = file.createdTime ?? null;
		dto.modifiedAt = file.modifiedTime ?? null;
		return dto;
	}
}
