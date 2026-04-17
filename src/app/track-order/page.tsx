'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Package, CheckCircle, Truck, Clock, XCircle, Loader2 } from 'lucide-react'

const STATUS_STEPS = [
  { key: 'PENDING',           label: 'Order Placed',      icon: Package,     desc: 'We received your order' },
  { key: 'CONFIRMED',         label: 'Confirmed',         icon: CheckCircle, desc: 'Order confirmed & assigned to baker' },
  { key: 'PROCESSING',        label: 'Being Prepared',    icon: Clock,       desc: 'Your cake is being freshly baked' },
  { key: 'OUT_FOR_DELIVERY',  label: 'Out for Delivery',  icon: Truck,       desc: 'Your cake is on the way!' },
  { key: 'DELIVERED',         label: 'Delivered',         icon: CheckCircle, desc: 'Enjoy your cake! 🎂' },
]
const STATUS_ORDER = STATUS_STEPS.map(s => s.key)

function TrackOrderInner() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('id') || '')
  const [order,   setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!orderId.trim()) return
    setLoading(true); setError(''); setOrder(null)
    try {
      const res  = await fetch(`/api/orders/${orderId.trim()}`)
      const data = await res.json()
      if (data.order) setOrder(data.order)
      else setError('Order not found. Please check your order number.')
    } catch {
      setError('Failed to fetch order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1
  const isCancelled = order?.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your order number to see real-time status</p>
        </div>

        <form onSubmit={doSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Enter order number..."
              value={orderId} onChange={(e) => setOrderId(e.target.value)}
              className="input-field pl-11 py-4 text-base"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-6 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {order && (
          <div className="space-y-5">
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-mono font-bold text-gray-900">#{order.orderNumber.slice(-12).toUpperCase()}</p>
                </div>
                <span className={`badge ${isCancelled ? 'bg-red-100 text-red-700' : order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-400">Customer</p><p className="font-semibold">{order.customerName}</p></div>
                <div><p className="text-gray-400">Phone</p><p className="font-semibold">{order.customerPhone}</p></div>
                <div><p className="text-gray-400">Delivery Date</p><p className="font-semibold">{order.deliveryDate}</p></div>
                <div><p className="text-gray-400">Time Slot</p><p className="font-semibold capitalize">{order.deliverySlot}</p></div>
                <div className="col-span-2">
                  <p className="text-gray-400">Address</p>
                  <p className="font-semibold">{order.address}, {order.city} – {order.pincode}</p>
                </div>
              </div>
            </div>

            {!isCancelled ? (
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-gray-900 mb-6">Delivery Progress</h3>
                <div className="relative">
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100">
                    <div
                      className="bg-gradient-to-b from-rose-500 to-rose-400 w-full transition-all duration-700"
                      style={{ height: `${currentStep >= 0 ? (currentStep / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="space-y-6">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= currentStep; const active = i === currentStep; const Icon = step.icon
                      return (
                        <div key={step.key} className="flex items-start gap-4 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 ${done ? 'bg-rose-600 shadow-md shadow-rose-200' : 'bg-white border-2 border-gray-200'}`}>
                            <Icon className={`w-5 h-5 ${done ? 'text-white' : 'text-gray-300'}`} />
                          </div>
                          <div className={`flex-1 pb-2 ${!done && !active ? 'opacity-40' : ''}`}>
                            <p className={`font-semibold text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                            {active && <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold mt-1"><span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />Current Status</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-6 bg-red-50 border-red-100">
                <div className="flex items-center gap-3 text-red-700">
                  <XCircle className="w-6 h-6" />
                  <div><p className="font-bold">Order Cancelled</p><p className="text-sm text-red-500">Please contact us for more info</p></div>
                </div>
              </div>
            )}

            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.variantName} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">₹{item.total.toFixed(0)}</p>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base pt-2">
                  <span>Total Paid</span><span className="text-rose-600">₹{order.total.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=Hi! I want to enquire about my order #${order.orderNumber}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contact Support on WhatsApp
            </a>
          </div>
        )}

        {!order && !loading && !error && (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-semibold">Enter your order number above</p>
            <p className="text-sm mt-1">You'll find it in your confirmation message</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF8F3] pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderInner />
    </Suspense>
  )
}
