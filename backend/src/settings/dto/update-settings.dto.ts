import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsObject, IsOptional, ValidateNested } from "class-validator";
import { NotificationPreferencesDto } from "./notification-preferences.dto";

export class UpdateSettingsDto {
	@ApiPropertyOptional({
		description: "Tema de la interfaz",
		enum: ["light", "dark"],
		example: "dark",
	})
	@IsIn(["light", "dark"])
	@IsOptional()
	theme?: string;

	@ApiPropertyOptional({
		description: "Idioma de la interfaz",
		enum: ["es", "en"],
		example: "es",
	})
	@IsIn(["es", "en"])
	@IsOptional()
	language?: string;

	@ApiPropertyOptional({
		description: "Paleta de color",
		enum: ["verde", "cobalto", "arcilla"],
		example: "verde",
	})
	@IsIn(["verde", "cobalto", "arcilla"])
	@IsOptional()
	palette?: string;

	@ApiPropertyOptional({
		type: NotificationPreferencesDto,
		description: "Preferencias de notificaciones push",
	})
	@IsObject()
	@IsOptional()
	@ValidateNested()
	@Type(() => NotificationPreferencesDto)
	notificationPreferences?: NotificationPreferencesDto;
}
