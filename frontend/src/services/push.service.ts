import { apiFetch, getAccessToken } from './api'

export type NotifPrefs = {
  vencimiento: boolean
  clase: boolean
  recordatorio: boolean
  sync: boolean
}

type SubscriptionResponse = {
  id: string
  endpoint: string
}

const SUB_ID_KEY = (userId: string) => `uptgo_push_sub_${userId}`

function getStoredSubId(userId: string): string | null {
  return localStorage.getItem(SUB_ID_KEY(userId))
}

function storeSubId(userId: string, id: string | null): void {
  if (id) localStorage.setItem(SUB_ID_KEY(userId), id)
  else localStorage.removeItem(SUB_ID_KEY(userId))
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

/** Error lanzado cuando el servidor push de Chrome (FCM) es inaccesible por red. */
export class PushNetworkError extends Error {
  constructor() {
    super('push_network_blocked')
    this.name = 'PushNetworkError'
  }
}

function classifyPushError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err)
  const name = err instanceof DOMException ? err.name : ''

  if (msg.includes('permission') || msg.includes('denied') || name === 'NotAllowedError') {
    throw new Error('Permiso de notificaciones denegado. Actívalo en la configuración del navegador.')
  }
  if (msg.includes('push service') || msg.includes('Registration failed') || msg.includes('push_network')) {
    throw new PushNetworkError()
  }
  if (msg.includes('applicationServerKey') || name === 'InvalidStateError') {
    throw new Error('La clave VAPID no coincide con una suscripción previa. Intenta de nuevo.')
  }
  throw new Error(`Error al registrar notificaciones: ${msg}`)
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return !!sub
  } catch {
    return false
  }
}

/** Fuerza la eliminación de cualquier suscripción push activa en el browser. */
async function clearBrowserSubscription(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) await existing.unsubscribe()
  } catch {
    // ignorar — el objetivo es dejar un estado limpio
  }
}

export async function subscribeToPush(userId: string): Promise<void> {
  if (!isPushSupported()) throw new Error('Notificaciones push no soportadas en este navegador')
  if (!getAccessToken()) throw new Error('Debes iniciar sesión para activar notificaciones')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Permiso de notificaciones denegado')

  // Obtener VAPID key antes de intentar suscribirse
  const { publicKey } = await apiFetch<{ publicKey: string }>('/notifications/vapid-public-key')
  const applicationServerKey = urlBase64ToUint8Array(publicKey)

  const reg = await navigator.serviceWorker.ready

  // Verificar si ya hay una suscripción válida para esta VAPID key
  let sub = await reg.pushManager.getSubscription()

  if (sub) {
    // Hay suscripción previa: verificar que su applicationServerKey coincida.
    // Si no, limpiarla para evitar el error "push service error".
    const toB64url = (bytes: Uint8Array) =>
      btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

    const existingKeyBuf = sub.options?.applicationServerKey
    const existingKey = existingKeyBuf ? toB64url(new Uint8Array(existingKeyBuf as ArrayBuffer)) : null
    const newKey = toB64url(applicationServerKey)

    if (existingKey !== newKey) {
      // Clave distinta → limpiar y re-suscribir
      await clearBrowserSubscription()
      sub = null
    }
  }

  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
    } catch (firstErr) {
      // "push service error" suele indicar suscripción previa corrupta o FCM inaccesible.
      // Limpiar estado del browser y reintentar una vez.
      await clearBrowserSubscription()
      try {
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
      } catch (retryErr) {
        classifyPushError(retryErr) // siempre lanza
      }
    }
  }

  const subJson = sub.toJSON()
  const p256dh = subJson.keys?.p256dh
  const auth = subJson.keys?.auth

  if (!p256dh || !auth) throw new Error('No se pudieron obtener las claves de la suscripción')

  const result = await apiFetch<SubscriptionResponse>('/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: sub.endpoint,
      p256dh,
      auth,
      userAgent: navigator.userAgent,
    }),
  })

  storeSubId(userId, result.id)
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  await clearBrowserSubscription()

  const subId = getStoredSubId(userId)
  if (subId) {
    await apiFetch(`/notifications/subscriptions/${subId}`, { method: 'DELETE' }).catch(() => {})
    storeSubId(userId, null)
  }
}

export async function getNotificationPreferences(): Promise<NotifPrefs> {
  const res = await apiFetch<{ notificationPreferences: NotifPrefs }>('/settings')
  return res.notificationPreferences
}

export async function updateNotificationPreferences(prefs: NotifPrefs): Promise<void> {
  await apiFetch('/settings', {
    method: 'PATCH',
    body: JSON.stringify({ notificationPreferences: prefs }),
  })
}

export async function sendTestNotification(type: keyof NotifPrefs): Promise<void> {
  await apiFetch('/notifications/test', {
    method: 'POST',
    body: JSON.stringify({
      type,
      title: 'UPTGO — Prueba',
      body: 'Las notificaciones están funcionando correctamente.',
      data: { url: '/' },
    }),
  })
}
