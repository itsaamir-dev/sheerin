'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/cart-store'
import { Check, Tag, Loader2, CreditCard, Smartphone, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const TIME_SLOTS = [
  { value: 'morning', label: '🌅 Morning (8 AM – 12 PM)' },
  { value: 'afternoon', label: '☀️ Afternoon (12 PM – 5 PM)' },
  { value: 'evening', label: '🌙 Evening (5 PM – 9 PM)' },
]

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery', icon: Package, desc: 'Pay when your cake arrives' },
  { value: 'UPI', label: 'UPI / QR Code', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
  { value: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCartStore()
  const [coupon, setCoupon] = useState('')
  const [couponData, setCouponData] = useState<any>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    address: '', city: '', pincode: '',
    deliveryDate: '', deliverySlot: 'morning',
    specialNote: '', paymentMethod: 'COD',
  })

  const sub = subtotal()
  const discount = couponData
    ? couponData.type === 'PERCENTAGE' ? (sub * couponData.value) / 100 : couponData.value
    : 0
  const deliveryFee = sub >= 500 ? 0 : 50
  const total = sub - discount + deliveryFee

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const applyCoupon = async () => {
    if (!coupon) return
    setCouponLoading(true)
    try {
      const res = await fetch(`/api/coupons/validate?code=${coupon}&amount=${sub}`)
      const data = await res.json()
      if (data.valid) { setCouponData(data.coupon); toast.success('Coupon applied! 🎉') }
      else toast.error(data.message || 'Invalid coupon')
    } catch { toast.error('Failed to apply coupon') }
    finally { setCouponLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) { toast.error('Your cart is empty!'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.product?.name,
            variantName: item.variant?.name,
            options: item.selectedOptions,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
          subtotal: sub,
          discount,
          deliveryFee,
          total,
          couponCode: couponData ? coupon : null,
        }),
      })
      const data = await res.json()
      if (data.order) {
        clearCart()
        router.push(`/order-success?id=${data.order.orderNumber}`)
      } else {
        toast.error(data.error || 'Failed to place order')
      }
    } catch { toast.error('Something went wrong!') }
    finally { setSubmitting(false) }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = new Date().toISOString().split('T')[0]

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious cakes first!</p>
          <a href="/products" className="btn-primary">Browse Cakes</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">📋 Contact Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input required type="text" className="input-field" placeholder="Your name" value={form.customerName} onChange={(e) => update('customerName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                    <input required type="tel" className="input-field" placeholder="10-digit number" value={form.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (optional)</label>
                    <input type="email" className="input-field" placeholder="For order updates" value={form.customerEmail} onChange={(e) => update('customerEmail', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">📍 Delivery Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address *</label>
                    <textarea required className="input-field h-20 resize-none" placeholder="House/Flat no., Street, Area" value={form.address} onChange={(e) => update('address', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                    <input required type="text" className="input-field" placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN Code *</label>
                    <input required type="text" className="input-field" placeholder="6-digit PIN" value={form.pincode} onChange={(e) => update('pincode', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">📅 Delivery Schedule</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Date *</label>
                    <input required type="date" className="input-field" min={minDate} value={form.deliveryDate} onChange={(e) => update('deliveryDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Slot *</label>
                    <select required className="input-field" value={form.deliverySlot} onChange={(e) => update('deliverySlot', e.target.value)}>
                      {TIME_SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions</label>
                    <textarea className="input-field h-20 resize-none" placeholder="Any special requests for delivery or the cake..." value={form.specialNote} onChange={(e) => update('specialNote', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">💳 Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMethod === pm.value ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-200'}`}
                    >
                      <input type="radio" name="payment" value={pm.value} checked={form.paymentMethod === pm.value} onChange={() => update('paymentMethod', pm.value)} className="sr-only" />
                      <pm.icon className={`w-5 h-5 ${form.paymentMethod === pm.value ? 'text-rose-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{pm.label}</p>
                        <p className="text-xs text-gray-500">{pm.desc}</p>
                      </div>
                      {form.paymentMethod === pm.value && <Check className="w-5 h-5 text-rose-600" />}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="space-y-4">
              <div className="card p-5 sticky top-24">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-rose-50 shrink-0">
                        <img src={item.product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">{item.variant?.name} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type="text" placeholder="Enter code" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} className="input-field pl-8 text-sm py-2.5" />
                    </div>
                    <button type="button" onClick={applyCoupon} disabled={couponLoading} className="px-3 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50">
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {couponData && (
                    <p className="text-green-600 text-xs font-semibold mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Coupon applied! You save ₹{discount.toFixed(0)}
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{sub.toFixed(0)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-semibold">-₹{discount.toFixed(0)}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className={deliveryFee === 0 ? 'font-semibold text-green-600' : 'font-semibold'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span></div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold">
                    <span>Total</span>
                    <span className="text-rose-600">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full mt-5 flex items-center justify-center gap-2 py-4 text-base"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Place Order • ₹{total.toFixed(0)}</>}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">🔒 Secure checkout</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
