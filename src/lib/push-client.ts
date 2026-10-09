'use client'
// Browser side of Web Push: service worker registration + subscription.

export type PushState = 'unsupported' | 'unconfigured' | 'denied' | 'default' | 'granted'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

export function pushState(): PushState {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window))
    return 'unsupported'
  if (!VAPID_PUBLIC_KEY) return 'unconfigured'
  return Notification.permission as PushState
}

/** iOS only allows web push for sites added to the Home Screen. */
export function needsHomeScreenInstall() {
  if (typeof window === 'undefined') return false
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone
  return ios && !standalone
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

/** Must be called from a user gesture (click) — browsers block permission prompts otherwise. */
export async function subscribeToPush(opts: { orderNumber?: string } = {}) {
  if (pushState() === 'unsupported' || !VAPID_PUBLIC_KEY) throw new Error('Notifications aren’t supported in this browser')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Notifications were blocked. You can enable them in your browser settings.')

  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
  const subscription =
    (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }))

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: subscription.toJSON(), orderNumber: opts.orderNumber }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Couldn’t switch on notifications')
}

export async function unsubscribeFromPush() {
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  const sub = await reg?.pushManager.getSubscription()
  if (!sub) return
  await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
  await sub.unsubscribe()
}

export async function isSubscribed() {
  if (pushState() !== 'granted') return false
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  return Boolean(await reg?.pushManager.getSubscription())
}
