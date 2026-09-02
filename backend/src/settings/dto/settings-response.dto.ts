import { ApiProperty } from "@nestjs/swagger";
import type { UserSettings } from "@prisma/client";
import type { NotificationPreferences } from "../types/notification-preferences.type";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "../types/notification-preferences.type";

export class NotificationPreferencesResponseDto {
	@ApiProperty({ example: true }) vencimiento: boolean;
	@ApiProperty({ example: true }) clase: boolean;
	@ApiProperty({ example: true }) recordatorio: boolean;
	@ApiProperty({ example: false }) sync: boolean;
}

export class SettingsResponseDto {
	@ApiProperty({ example: "uuid-v4" })
	id: string;

	@ApiProperty({ example: "uuid-v4" })
	userId: string;

	@ApiProperty({ enum: ["light", "dark"], example: "light" })
	theme: string;

	@ApiProperty({ enum: ["es", "en"], example: "es" })
	language: string;

	@ApiProperty({ enum: ["verde", "cobalto", "arcilla"], example: "cobalto" })
	palette: string;

	@ApiProperty({ type: NotificationPreferencesResponseDto })
	notificationPreferences: NotificationPreferences;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	static from(settings: UserSettings): SettingsResponseDto {
		const dto = new SettingsResponseDto();
		dto.id = settings.id;
		dto.userId = settings.userId;
		dto.theme = settings.theme;
		dto.language = settings.language;
		dto.palette = settings.palette;
		dto.notificationPreferences = {
			...DEFAULT_NOTIFICATION_PREFERENCES,
			...(settings.notificationPreferences as Partial<NotificationPreferences>),
		};
		dto.createdAt = settings.createdAt;
		dto.updatedAt = settings.updatedAt;
		return dto;
	}
}
