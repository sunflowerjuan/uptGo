export interface NotificationPreferences {
	vencimiento: boolean;
	clase: boolean;
	recordatorio: boolean;
	sync: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
	vencimiento: true,
	clase: true,
	recordatorio: true,
	sync: false,
};
