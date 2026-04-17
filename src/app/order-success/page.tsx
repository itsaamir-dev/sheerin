'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Clock, Phone, ArrowRight } from 'lucide-react'

function OrderSuccessInner() {
  const params  = useSearchParams()
  const orderId = params.get('id')

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success ring animation */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div className="absolute w-36 h-36 border-4 border-green-200 rounded-full animate-ping opacity-20" />
        </div>

        <div className="text-5xl mb-4">🎂</div>
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 text-lg mb-6">
          Your cake is being prepared with love. We can't wait to deliver it!
        </p>

        {orderId && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-8">
            <p className="text-sm text-gray-500 mb-1">Order Number</p>
            <p className="font-mono font-bold text-rose-600 text-lg">{orderId}</p>
            <p className="text-xs text-gray-400 mt-1">Save this for tracking your order</p>
          </div>
        )}

        {/* Status mini-steps */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: CheckCircle, label: 'Order Confirmed', status: 'done'    },
            { icon: Package,     label: 'Being Prepared',  status: 'active'  },
            { icon: Clock,       label: 'Out for Delivery', status: 'pending' },
          ].map(({ icon: Icon, label, status }) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl ${
                status === 'done'   ? 'bg-green-50' :
                status === 'active' ? 'bg-amber-50' : 'bg-gray-50'
              }`}
            >
              <Icon className={`w-6 h-6 ${
                status === 'done'   ? 'text-green-500' :
                status === 'active' ? 'text-amber-500' : 'text-gray-300'
              }`} />
              <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          {orderId && (
            <Link
              href={`/track-order?id=${orderId}`}
              className="btn-primary flex items-center justify-center gap-2"
            >
              Track Your Order <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent(`Hi! I placed an order${orderId ? ` #${orderId}` : ''}. Can you confirm?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <Phone className="w-4 h-4" />
            Contact via WhatsApp
          </a>
          <Link href="/products" className="btn-secondary">
            Order More Cakes
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF8F3] pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderSuccessInner />
    </Suspense>
  )
}
