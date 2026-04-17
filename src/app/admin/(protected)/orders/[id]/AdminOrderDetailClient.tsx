'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Package, MapPin, Clock, CreditCard,
  CheckCircle, Truck, Loader2, MessageSquare, Phone
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_FLOW = [
  { key: 'PENDING',           label: 'Pending',           color: 'bg-yellow-500' },
  { key: 'CONFIRMED',         label: 'Confirmed',         color: 'bg-blue-500' },
  { key: 'PROCESSING',        label: 'Processing',        color: 'bg-purple-500' },
  { key: 'OUT_FOR_DELIVERY',  label: 'Out for Delivery',  color: 'bg-orange-500' },
  { key: 'DELIVERED',         label: 'Delivered',         color: 'bg-green-500' },
]

const STATUS_BADGE: Record<string, string> = {
  PENDING:          'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED:        'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING:       'bg-purple-100 text-purple-800 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800 border-orange-200',
  DELIVERED:        'bg-green-100 text-green-800 border-green-200',
  CANCELLED:        'bg-red-100 text-red-800 border-red-200',
}

export function AdminOrderDetailClient({ order }: { order: any }) {
  const router = useRouter()
  const [status, setStatus]   = useState(order.status)
  const [saving, setSaving]   = useState(false)

  const updateStatus = async (newStatus: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus)
        toast.success('Status updated!')
        router.refresh()
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Error updating status')
    } finally {
      setSaving(false)
    }
  }

  const whatsappMsg = encodeURIComponent(
    `Hi ${order.customerName}! Your Sheerin order #${order.orderNumber.slice(-8).toUpperCase()} is now ${status.replace(/_/g, ' ')}. ${status === 'OUT_FOR_DELIVERY' ? 'Your cake is on the way! 🚀' : status === 'DELIVERED' ? 'Enjoy your cake! 🎂' : "We'll keep you updated!"}`
  )

  const currentIdx = STATUS_FLOW.findIndex(s => s.key === status)

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Order #{order.orderNumber.slice(-8).toUpperCase()}
            </h1>
            <span className={`badge border ${STATUS_BADGE[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date(order.createdAt).toLocaleString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Status stepper */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-display font-bold text-lg text-gray-900 mb-5">Update Status</h2>
            <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-2">
              {STATUS_FLOW.map((s, i) => {
                const done    = i <= currentIdx
                const active  = i === currentIdx
                return (
                  <div key={s.key} className="flex items-center min-w-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        active ? `${s.color} text-white border-transparent shadow-lg` :
                        done   ? 'bg-gray-200 text-gray-500 border-transparent' :
                                 'bg-white text-gray-300 border-gray-200'
                      }`}>
                        {i + 1}
                      </div>
                      <p className={`text-[10px] font-semibold mt-1 text-center w-16 leading-tight ${active ? 'text-gray-900' : done ? 'text-gray-400' : 'text-gray-300'}`}>
                        {s.label}
                      </p>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`h-0.5 w-8 mx-1 flex-shrink-0 mt-[-12px] ${i < currentIdx ? 'bg-gray-300' : 'bg-gray-100'}`} />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s.key}
                  onClick={() => updateStatus(s.key)}
                  disabled={saving || s.key === status}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border-2 transition-all ${
                    s.key === status
                      ? `${s.color} text-white border-transparent shadow-md`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 disabled:opacity-40'
                  }`}
                >
                  {saving && s.key !== status ? '' : s.label}
                </button>
              ))}
              <button
                onClick={() => updateStatus('CANCELLED')}
                disabled={saving || status === 'CANCELLED' || status === 'DELIVERED'}
                className="px-4 py-2 rounded-full text-xs font-semibold border-2 bg-white text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-30 transition-all"
              >
                Cancel Order
              </button>
              {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400 mt-2" />}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-display font-bold text-lg text-gray-900 mb-4">
              <Package className="inline w-5 h-5 mr-2 text-rose-500" />
              Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item: any, i: number) => {
                let opts: Record<string, string> = {}
                try { opts = JSON.parse(item.options || '{}') } catch {}
                return (
                  <div key={i} className="flex items-start justify-between p-4 bg-rose-50/50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-sm text-gray-500 mt-0.5">Size: {item.variantName}</p>
                      )}
                      {Object.entries(opts).map(([k, v]) => (
                        <p key={k} className="text-sm text-gray-500">{k}: {v as string}</p>
                      ))}
                      <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity} × ₹{item.price.toFixed(0)}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">₹{item.total.toFixed(0)}</p>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{order.subtotal.toFixed(0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span className="font-semibold">−₹{order.discount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span className="font-semibold text-gray-800">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2">
                <span>Total</span>
                <span className="text-rose-600 text-lg">₹{order.total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-display font-bold text-base text-gray-900 mb-4">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-600">
                  {order.customerName[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{order.customerName}</p>
                  {order.customerEmail && <p className="text-xs text-gray-400">{order.customerEmail}</p>}
                </div>
              </div>
              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 transition-colors"
              >
                <Phone className="w-4 h-4 text-gray-400" />
                {order.customerPhone}
              </a>
              <a
                href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${whatsappMsg}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors w-full"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Notify via WhatsApp
              </a>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-display font-bold text-base text-gray-900 mb-4">
              <MapPin className="inline w-4 h-4 mr-1.5 text-rose-500" />
              Delivery Details
            </h2>
            <div className="space-y-2.5 text-sm text-gray-600">
              <p className="leading-relaxed">{order.address}</p>
              <p className="font-semibold text-gray-800">{order.city} — {order.pincode}</p>
              <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-700 px-3 py-2 rounded-lg font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {order.deliveryDate} · {order.deliverySlot.charAt(0).toUpperCase() + order.deliverySlot.slice(1)}
              </div>
              {order.specialNote && (
                <div className="flex items-start gap-2 text-xs bg-gray-50 px-3 py-2 rounded-lg text-gray-600">
                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {order.specialNote}
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-display font-bold text-base text-gray-900 mb-4">
              <CreditCard className="inline w-4 h-4 mr-1.5 text-rose-500" />
              Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-semibold text-gray-800">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold ${
                  order.paymentStatus === 'PAID' ? 'text-green-600' :
                  order.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-rose-600">₹{order.total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
