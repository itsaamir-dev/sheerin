'use client'
import { useState } from 'react'
import { Bell, Loader2, Send, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const AUTOMATIC = [
  ['Order placed', 'When a customer places an order (account devices) or turns on updates for it'],
  ['Order confirmed / being prepared', 'When you change the order status'],
  ['Out for delivery / delivered', 'Delivery updates from the order status'],
  ['Payment received / failed', 'When you change the payment status'],
  ['Items added', 'When products are added to an existing order'],
  ['Order cancelled', 'When an order is cancelled'],
]

export function AdminNotificationsClient({ configured, stats }: { configured: boolean; stats: { total: number; promo: number; linkedToAccounts: number } }) {
  const [form, setForm] = useState({ title: '', body: '', url: '/products' })
  const [sending, setSending] = useState(false)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm(`Send this notification to ${stats.promo} device(s)?`)) return
    setSending(true)
    try {
      const res = await fetch('/api/push/broadcast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to send')
      toast.success(`Delivered to ${d.sent} of ${d.total} device(s)`)
      setForm({ title: '', body: '', url: '/products' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-gray-900">Push Notifications</h1>
      <p className="text-gray-500 mt-1 mb-8">Browser notifications for order updates and promotions.</p>

      {!configured && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mb-6 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Push isn’t configured on this server</p>
            <p>Set <code>NEXT_PUBLIC_VAPID_PUBLIC_KEY</code>, <code>VAPID_PRIVATE_KEY</code> and <code>VAPID_SUBJECT</code> (generate keys with <code>npx web-push generate-vapid-keys</code>), then redeploy. Until then, customers won’t see the “Enable notifications” prompt.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          ['Subscribed devices', stats.total],
          ['Accept promotions', stats.promo],
          ['Linked to accounts', stats.linkedToAccounts],
        ].map(([label, n]) => (
          <div key={label as string} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{n}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={send} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2"><Send className="w-4 h-4 text-rose-500" /> Send a promotion</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input required maxLength={80} className="input-field" placeholder="Weekend special: 20% off 🎂" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
            <textarea required maxLength={200} className="input-field h-20 resize-none" placeholder="Use code SWEET20 on orders above ₹800. Ends Sunday." value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Opens page</label>
            <input className="input-field" placeholder="/products" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} />
          </div>
          <button type="submit" disabled={!configured || sending || stats.promo === 0} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send to {stats.promo} device{stats.promo === 1 ? '' : 's'}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-rose-500" /> Sent automatically</h2>
          <ul className="space-y-3">
            {AUTOMATIC.map(([t, d]) => (
              <li key={t} className="text-sm">
                <p className="font-semibold text-gray-800">{t}</p>
                <p className="text-gray-500">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
