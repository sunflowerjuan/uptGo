import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { SyncMetadata } from "@prisma/client";
import { SyncStatus } from "@prisma/client";

export class SyncResponseDto {
	@ApiProperty({ example: "uuid-v4" })
	id: string;

	@ApiProperty({ example: "uuid-v4" })
	userId: string;

	@ApiProperty({ enum: SyncStatus, example: SyncStatus.IDLE })
	syncStatus: SyncStatus;

	@ApiProperty({
		description: "Versión incremental de la última sincronización exitosa",
		example: 4,
	})
	syncVersion: number;

	@ApiPropertyOptional({
		description: "Fecha de la última sincronización completada",
		nullable: true,
	})
	lastSyncAt: Date | null;

	@ApiProperty()
	updatedAt: Date;

	static from(sync: SyncMetadata): SyncResponseDto {
		const dto = new SyncResponseDto();
		dto.id = sync.id;
		dto.userId = sync.userId;
		dto.syncStatus = sync.syncStatus;
		dto.syncVersion = sync.syncVersion;
		dto.lastSyncAt = sync.lastSyncAt;
		dto.updatedAt = sync.updatedAt;
		return dto;
	}
}
