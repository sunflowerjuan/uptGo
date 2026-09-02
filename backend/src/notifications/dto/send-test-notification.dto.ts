import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { NotificationKind } from "../types/push-payload.type";

export class SendTestNotificationDto {
	@ApiProperty({
		description: "Tipo de notificación (afecta el filtro de preferencias)",
		enum: [
			"vencimiento",
			"clase",
			"recordatorio",
			"sync",
		] satisfies NotificationKind[],
		example: "recordatorio",
	})
	@IsIn(["vencimiento", "clase", "recordatorio", "sync"])
	type: NotificationKind;

	@ApiProperty({
		description: "Título de la notificación",
		example: "Recordatorio de prueba",
	})
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({
		description: "Cuerpo de la notificación",
		example: "Esta es una notificación de prueba desde UPTGO.",
	})
	@IsString()
	@IsNotEmpty()
	body: string;

	@ApiPropertyOptional({
		description: "Datos adicionales enviados al Service Worker",
		example: { route: "/reminders" },
	})
	@IsOptional()
	data?: Record<string, unknown>;
}
