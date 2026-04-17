'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Tag, ToggleRight, ToggleLeft, X, Loader2, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminCouponsClient({ coupons }: { coupons: any[] }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({
    code: '', type: 'PERCENTAGE', value: '', minOrderValue: '0',
    maxUses: '', expiresAt: '', active: true,
  })

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !current }),
    })
    if (res.ok) { toast.success('Updated!'); router.refresh() }
    else toast.error('Failed to update')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: parseFloat(form.value),
          minOrderValue: parseFloat(form.minOrderValue) || 0,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
          active: form.active,
        }),
      })
      if (res.ok) {
        toast.success('Coupon created!')
        setShowModal(false)
        router.refresh()
        setForm({ code: '', type: 'PERCENTAGE', value: '', minOrderValue: '0', maxUses: '', expiresAt: '', active: true })
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to create coupon')
      }
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 mt-1">{coupons.length} coupons total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Coupon cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((c) => (
          <div key={c.id} className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${c.active ? 'border-rose-100' : 'border-gray-100 opacity-60'}`}>
            {/* Top gradient */}
            <div className={`h-2 ${c.type === 'PERCENTAGE' ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.type === 'PERCENTAGE' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                    <Tag className={`w-4 h-4 ${c.type === 'PERCENTAGE' ? 'text-rose-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-gray-900">{c.code}</p>
                    <p className="text-xs text-gray-400">{c.type === 'PERCENTAGE' ? `${c.value}% off` : `₹${c.value} off`}</p>
                  </div>
                </div>
                <button onClick={() => copyCode(c.code)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  {copied === c.code ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Min order</span>
                  <span className="font-semibold text-gray-700">₹{c.minOrderValue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Used</span>
                  <span className="font-semibold text-gray-700">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</span>
                </div>
                {c.expiresAt && (
                  <div className="flex justify-between">
                    <span>Expires</span>
                    <span className={`font-semibold ${new Date(c.expiresAt) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                      {new Date(c.expiresAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`badge ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.active ? '● Active' : '○ Inactive'}
                </span>
                <button
                  onClick={() => toggleActive(c.id, c.active)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  {c.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                  {c.active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No coupons yet</p>
          <p className="text-sm">Create your first coupon to boost sales!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl">Create Coupon</h2>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Coupon Code *</label>
                <input required type="text" className="input-field font-mono uppercase" placeholder="WELCOME10" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type *</label>
                  <select required className="input-field" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Value * {form.type === 'PERCENTAGE' ? '(%)' : '(₹)'}
                  </label>
                  <input required type="number" min="0" max={form.type === 'PERCENTAGE' ? 100 : undefined} className="input-field" placeholder={form.type === 'PERCENTAGE' ? '10' : '100'} value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Order (₹)</label>
                  <input type="number" min="0" className="input-field" placeholder="0" value={form.minOrderValue} onChange={(e) => setForm((p) => ({ ...p, minOrderValue: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Uses</label>
                  <input type="number" min="1" className="input-field" placeholder="Unlimited" value={form.maxUses} onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
                  <input type="date" className="input-field" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="w-4 h-4 rounded text-rose-600" />
                <span className="text-sm font-medium text-gray-700">Active immediately</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
