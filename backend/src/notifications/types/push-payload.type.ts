export type NotificationKind = 'vencimiento' | 'clase' | 'recordatorio' | 'sync';

export interface PushPayload {
  type: NotificationKind;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}
