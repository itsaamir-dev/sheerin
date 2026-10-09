'use client'
import { useEffect, useState } from 'react'
import { Bell, BellRing, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { isSubscribed, needsHomeScreenInstall, pushState, subscribeToPush, type PushState } from '@/lib/push-client'

/**
 * "Get live updates" card. Linking the order number lets guests (no account) get
 * notifications for this order; signed-in customers get them for all their orders.
 */
export function PushOptIn({ orderNumber, compact = false }: { orderNumber?: string; compact?: boolean }) {
  const [state, setState] = useState<PushState | null>(null)
  const [linked, setLinked] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => { setState(pushState()) }, [])

  // Hidden where it can't work — no dead buttons.
  if (!state || state === 'unsupported' || state === 'unconfigured') return null

  const enable = async () => {
    setBusy(true)
    try {
      await subscribeToPush({ orderNumber })
      setLinked(true)
      setState('granted')
      toast.success('Notifications on 🔔')
    } catch (e: any) {
      setState(pushState())
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const iosHint = needsHomeScreenInstall()

  if (linked) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl bg-green-50 border border-green-100 text-green-800 ${compact ? 'p-3 text-sm' : 'p-4'}`}>
        <Check className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">You’ll get a notification as {orderNumber ? 'this order' : 'your orders'} progresses.</p>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-white border border-rose-100 text-left ${compact ? 'p-3' : 'p-4'}`}>
      <span className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
        {state === 'denied' ? <Bell className="w-5 h-5 text-gray-400" /> : <BellRing className="w-5 h-5 text-rose-600" />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Get live order updates</p>
        <p className="text-xs text-gray-500">
          {state === 'denied'
            ? 'Notifications are blocked for this site — allow them in your browser settings.'
            : iosHint
              ? 'On iPhone, tap Share → Add to Home Screen first, then enable here.'
              : 'Confirmation, payment, baking and delivery alerts.'}
        </p>
      </div>
      {state !== 'denied' && (
        <button onClick={enable} disabled={busy} className="btn-primary text-sm px-4 py-2 shrink-0 flex items-center gap-1.5">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enable'}
        </button>
      )}
    </div>
  )
}

/** Small settings toggle for the profile page. */
export function PushSettingsRow() {
  const [state, setState] = useState<PushState | null>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    setState(pushState())
    isSubscribed().then(setOn).catch(() => {})
  }, [])
  if (!state || state === 'unsupported' || state === 'unconfigured') return null
  if (on) {
    return <p className="text-sm text-green-700 flex items-center gap-2"><Check className="w-4 h-4" />Order notifications are on for this device</p>
  }
  return <PushOptIn compact />
}
