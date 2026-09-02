import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UploadAttachmentDto {
	@ApiProperty({ description: "Nombre del archivo", example: "foto-tarea.jpg" })
	@IsString()
	@IsNotEmpty()
	fileName: string;

	@ApiProperty({ description: "Tipo MIME del archivo", example: "image/jpeg" })
	@IsString()
	@IsNotEmpty()
	mimeType: string;

	@ApiProperty({ description: "Contenido del archivo codificado en base64" })
	@IsString()
	@IsNotEmpty()
	content: string;

	@ApiPropertyOptional({
		description: "ID del elemento padre (nota o tarea)",
		example: "task-abc123",
	})
	@IsString()
	@IsOptional()
	parentId?: string;

	@ApiPropertyOptional({
		description: "Tipo del elemento padre",
		example: "task",
	})
	@IsString()
	@IsOptional()
	parentType?: string;
}
