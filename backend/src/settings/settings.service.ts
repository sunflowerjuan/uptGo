import { Injectable } from "@nestjs/common";
import type { Prisma, UserSettings } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SettingsResponseDto } from "./dto/settings-response.dto";
import type { UpdateSettingsDto } from "./dto/update-settings.dto";
import {
	DEFAULT_NOTIFICATION_PREFERENCES,
	type NotificationPreferences,
} from "./types/notification-preferences.type";

@Injectable()
export class SettingsService {
	constructor(private readonly prisma: PrismaService) {}

	async findByUser(userId: string): Promise<SettingsResponseDto> {
		const settings = await this.prisma.userSettings.upsert({
			where: { userId },
			create: {
				userId,
				notificationPreferences:
					DEFAULT_NOTIFICATION_PREFERENCES as unknown as Prisma.InputJsonValue,
			},
			update: {},
		});

		return SettingsResponseDto.from(settings);
	}

	async update(
		userId: string,
		dto: UpdateSettingsDto,
	): Promise<SettingsResponseDto> {
		const current = await this.findByUser(userId);

		const mergedPreferences: NotificationPreferences =
			dto.notificationPreferences
				? { ...current.notificationPreferences, ...dto.notificationPreferences }
				: current.notificationPreferences;

		const settings: UserSettings = await this.prisma.userSettings.update({
			where: { userId },
			data: {
				...(dto.theme !== undefined && { theme: dto.theme }),
				...(dto.language !== undefined && { language: dto.language }),
				...(dto.palette !== undefined && { palette: dto.palette }),
				...(dto.notificationPreferences !== undefined && {
					notificationPreferences:
						mergedPreferences as unknown as Prisma.InputJsonValue,
				}),
			},
		});

		return SettingsResponseDto.from(settings);
	}

	async getNotificationPreferences(
		userId: string,
	): Promise<NotificationPreferences> {
		const settings = await this.findByUser(userId);
		return settings.notificationPreferences;
	}
}
