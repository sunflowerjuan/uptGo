import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class NotificationPreferencesDto {
	@ApiPropertyOptional({
		description: "Notificaciones de vencimiento de tareas",
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	vencimiento?: boolean;

	@ApiPropertyOptional({
		description: "Notificaciones de inicio de clases",
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	clase?: boolean;

	@ApiPropertyOptional({
		description: "Recordatorios personales",
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	recordatorio?: boolean;

	@ApiPropertyOptional({
		description: "Notificaciones de sincronización completada",
		example: false,
	})
	@IsBoolean()
	@IsOptional()
	sync?: boolean;
}
