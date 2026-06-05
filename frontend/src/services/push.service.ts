// push.service.ts — Push notification subscription management for UPTGO PWA.

import { getAccessToken } from './api'

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api'

export const PUSH_SUB_KEY = 'uptgo_push_subscription_id'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function getVapidKey(): Promise<string> {
  const res = await fetch(`${API_BASE}/notifications/vapid-public-key`)
  if (!res.ok) throw new Error('No se pudo obtener la clave VAPID')
  const data = (await res.json()) as { publicKey: string }
  return data.publicKey
}

export async function subscribeToPush(): Promise<string | null> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const registration = await navigator.serviceWorker.ready
  const vapidKey = await getVapidKey()

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })

  const token = getAccessToken()
  const res = await fetch(`${API_BASE}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(subscription.toJSON()),
  })

  if (!res.ok) {
    await subscription.unsubscribe()
    return null
  }

  const { id } = (await res.json()) as { id: string }
  localStorage.setItem(PUSH_SUB_KEY, id)
  return id
}

export async function unsubscribeFromPush(): Promise<void> {
  const subId = localStorage.getItem(PUSH_SUB_KEY)
  if (!subId) return

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) await subscription.unsubscribe()

  const token = getAccessToken()
  await fetch(`${API_BASE}/notifications/subscriptions/${subId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).catch(() => {
    // silent fail if offline
  })

  localStorage.removeItem(PUSH_SUB_KEY)
}

export function isPushSubscribed(): boolean {
  return !!localStorage.getItem(PUSH_SUB_KEY)
}
