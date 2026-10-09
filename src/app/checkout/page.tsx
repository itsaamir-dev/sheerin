'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore, useAddToOrderStore, useCartHydrated } from '@/lib/cart-store'
import { Check, Tag, Loader2, CreditCard, Smartphone, Package, CalendarDays, Zap, AlertCircle, PlusCircle, X } from 'lucide-react'
import {
  DELIVERY_CONFIG, addDays, bakeryNow, dayLabel, deliveryFeeFor, getDeliveryDates, getSlotAvailability,
  isPincodeServiceable, sameDayTimeLeft, slotLabel,
} from '@/lib/delivery'
import { useDeliveryClock } from '@/hooks/useDeliveryClock'
import type { CartItem } from '@/types'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery', icon: Package, desc: 'Pay when your order arrives' },
  { value: 'UPI', label: 'UPI / QR Code', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
  { value: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
]

const lineTotal = (item: CartItem) => (item.price + item.extras.reduce((s, e) => s + e.price, 0)) * item.quantity

const toOrderLines = (items: CartItem[]) =>
  items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    variantName: item.variant?.name,
    options: item.selectedOptions,
    extras: item.extras.map((e) => e.name),
    quantity: item.quantity,
  }))

export default function CheckoutPage() {
  const { items, subtotal } = useCartStore()
  const target = useAddToOrderStore((s) => s.target)
  const hydrated = useCartHydrated()

  if (!hydrated) return <div className="min-h-screen bg-[#FDF8F3] pt-24" />

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] pt-24 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            {target ? `Add products to include them in order ${target.displayNumber}.` : 'Add some delicious cakes first!'}
          </p>
          <Link href="/products" className="btn-primary">Browse Cakes</Link>
        </div>
      </div>
    )
  }

  return target ? <AddToOrderCheckout target={target} items={items} cartSubtotal={subtotal()} /> : <NewOrderCheckout items={items} sub={subtotal()} />
}

// ─── New order ────────────────────────────────────────────────────────────────
function NewOrderCheckout({ items, sub }: { items: CartItem[]; sub: number }) {
  const router = useRouter()
  const { clearCart, applyServerPrices } = useCartStore()
  const now = useDeliveryClock()
  const [coupon, setCoupon] = useState('')
  const [couponData, setCouponData] = useState<any>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    address: '', city: '', pincode: '',
    deliveryDate: '', deliverySlot: '',
    specialNote: '', paymentMethod: 'COD',
  })
  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))

  // ── Delivery scheduling ──
  const dates = useMemo(() => (now ? getDeliveryDates(7, now) : []), [now])
  const slots = useMemo(() => (now && form.deliveryDate ? getSlotAvailability(form.deliveryDate, now) : []), [now, form.deliveryDate])
  const today = now ? bakeryNow(now).date : ''
  const timeLeft = now ? sameDayTimeLeft(now) : null

  // Default to the earliest bookable date once the clock is known.
  useEffect(() => {
    if (now && !form.deliveryDate) {
      const first = dates.find((d) => d.hasSlots)
      if (first) update('deliveryDate', first.date)
    }
  }, [now, dates, form.deliveryDate])

  // Keep the chosen slot valid: pick the first open slot on date change, and drop a slot that expires while the page is open.
  useEffect(() => {
    if (!slots.length) return
    const current = slots.find((s) => s.value === form.deliverySlot)
    if (current?.available) return
    const first = slots.find((s) => s.available)
    if (form.deliverySlot && current && !current.available) toast.error(`${current.label} slot is no longer available`)
    update('deliverySlot', first ? first.value : '')
  }, [slots]) // eslint-disable-line react-hooks/exhaustive-deps

  const pincodeError = form.pincode.length === 6 && !isPincodeServiceable(form.pincode) ? 'Sorry, we don’t deliver to this PIN code yet' : ''

  const discount = couponData
    ? Math.min(sub, couponData.type === 'PERCENTAGE' ? (sub * couponData.value) / 100 : couponData.value)
    : 0
  const deliveryFee = deliveryFeeFor(sub)
  const total = sub - discount + deliveryFee

  const applyCoupon = async () => {
    if (!coupon) return
    setCouponLoading(true)
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(coupon)}&amount=${sub}`)
      const data = await res.json()
      if (data.valid) { setCouponData(data.coupon); toast.success('Coupon applied! 🎉') }
      else { setCouponData(null); toast.error(data.message || 'Invalid coupon') }
    } catch { toast.error('Failed to apply coupon') }
    finally { setCouponLoading(false) }
  }

  // Re-validate an applied coupon if the cart total changes underneath it.
  useEffect(() => {
    if (couponData && sub < couponData.minOrderValue) {
      setCouponData(null)
      toast.error(`Coupon removed — minimum order is ₹${couponData.minOrderValue}`)
    }
  }, [sub, couponData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.deliveryDate || !form.deliverySlot) { toast.error('Please choose a delivery date and time slot'); return }
    if (!/^\d{6}$/.test(form.pincode) || pincodeError) { toast.error(pincodeError || 'Please enter a valid 6-digit PIN code'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: toOrderLines(items), total, couponCode: couponData ? coupon : null }),
      })
      const data = await res.json()
      if (res.status === 409 && data.repriced) {
        applyServerPrices(data.repriced)
        toast.error(data.error, { duration: 6000 })
        return
      }
      if (data.order) {
        clearCart()
        router.push(`/order-success?id=${encodeURIComponent(data.order.orderNumber)}`)
      } else {
        if (data.field === 'coupon') setCouponData(null)
        toast.error(data.error || 'Failed to place order')
      }
    } catch { toast.error('Something went wrong!') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6 md:mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-5 md:p-6">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">📋 Contact Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name *">
                    <input required type="text" autoComplete="name" className="input-field" placeholder="Your name" value={form.customerName} onChange={(e) => update('customerName', e.target.value)} />
                  </Field>
                  <Field label="Phone Number *">
                    <input required type="tel" autoComplete="tel" inputMode="numeric" pattern="[0-9+\s-]{10,15}" className="input-field" placeholder="10-digit number" value={form.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} />
                  </Field>
                  <Field label="Email (optional)" className="sm:col-span-2">
                    <input type="email" autoComplete="email" className="input-field" placeholder="For order updates" value={form.customerEmail} onChange={(e) => update('customerEmail', e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="card p-5 md:p-6">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">📍 Delivery Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Address *" className="sm:col-span-2">
                    <textarea required autoComplete="street-address" className="input-field h-20 resize-none" placeholder="House/Flat no., Street, Area, Landmark" value={form.address} onChange={(e) => update('address', e.target.value)} />
                  </Field>
                  <Field label="City *">
                    <input required type="text" autoComplete="address-level2" className="input-field" placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
                  </Field>
                  <Field label="PIN Code *" error={pincodeError}>
                    <input required type="text" autoComplete="postal-code" inputMode="numeric" maxLength={6} className="input-field" placeholder="6-digit PIN" value={form.pincode} onChange={(e) => update('pincode', e.target.value.replace(/\D/g, ''))} />
                  </Field>
                </div>
              </div>

              <div className="card p-5 md:p-6">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-1">📅 Delivery Schedule</h2>
                {now && (
                  <p className={`text-sm mb-5 flex items-center gap-1.5 ${timeLeft ? 'text-green-700' : 'text-gray-500'}`}>
                    {timeLeft ? (
                      <><Zap className="w-4 h-4" /> Same-day delivery available — order within {timeLeft.hours ? `${timeLeft.hours}h ` : ''}{timeLeft.minutes}m</>
                    ) : (
                      <><AlertCircle className="w-4 h-4" /> Same-day delivery is closed for today (orders by {DELIVERY_CONFIG.sameDayCutoffHour > 12 ? DELIVERY_CONFIG.sameDayCutoffHour - 12 : DELIVERY_CONFIG.sameDayCutoffHour} PM). Next-day slots are open.</>
                    )}
                  </p>
                )}

                <p className="block text-sm font-medium text-gray-700 mb-2">Delivery Date *</p>
                {!now ? (
                  <div className="flex gap-2">{[...Array(5)].map((_, i) => <div key={i} className="w-20 h-16 rounded-xl skeleton" />)}</div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                    {dates.map((d) => {
                      const selected = form.deliveryDate === d.date
                      return (
                        <button
                          key={d.date}
                          type="button"
                          disabled={!d.hasSlots}
                          onClick={() => update('deliveryDate', d.date)}
                          title={d.hasSlots ? undefined : 'No slots left on this day'}
                          className={`shrink-0 w-[84px] py-2.5 rounded-xl border-2 text-center transition-all ${
                            selected ? 'border-rose-500 bg-rose-50' : d.hasSlots ? 'border-gray-200 bg-white hover:border-rose-300' : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className={`block text-xs font-bold ${selected ? 'text-rose-700' : 'text-gray-800'}`}>{d.label.split(',')[0]}</span>
                          <span className="block text-[11px] text-gray-500 mt-0.5">
                            {new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                          </span>
                          {!d.hasSlots && <span className="block text-[10px] text-gray-400">Closed</span>}
                        </button>
                      )
                    })}
                    <label className={`shrink-0 w-[84px] py-2.5 rounded-xl border-2 text-center cursor-pointer relative ${
                      form.deliveryDate && !dates.some((d) => d.date === form.deliveryDate) ? 'border-rose-500 bg-rose-50' : 'border-dashed border-gray-300 bg-white hover:border-rose-300'
                    }`}>
                      <CalendarDays className="w-4 h-4 mx-auto text-gray-500" />
                      <span className="block text-[11px] text-gray-600 mt-0.5">
                        {form.deliveryDate && !dates.some((d) => d.date === form.deliveryDate) ? dayLabel(form.deliveryDate, now) : 'Later date'}
                      </span>
                      <input
                        type="date"
                        aria-label="Pick a later delivery date"
                        min={addDays(today, 1)}
                        max={addDays(today, DELIVERY_CONFIG.maxAdvanceDays)}
                        value={form.deliveryDate}
                        onChange={(e) => e.target.value && update('deliveryDate', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                )}

                {form.deliveryDate && (
                  <>
                    <p className="block text-sm font-medium text-gray-700 mt-5 mb-2">Time Slot *</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Delivery time slot">
                      {slots.map((s) => {
                        const selected = form.deliverySlot === s.value
                        return (
                          <button
                            key={s.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            disabled={!s.available}
                            onClick={() => update('deliverySlot', s.value)}
                            className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                              selected ? 'border-rose-500 bg-rose-50' : s.available ? 'border-gray-200 bg-white hover:border-rose-300' : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                            }`}
                          >
                            <span className={`block text-sm font-semibold ${s.available ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{s.label}</span>
                            <span className={`block text-xs ${s.available ? 'text-gray-500' : 'text-gray-400'}`}>{s.time}</span>
                            {!s.available && <span className="block text-[11px] text-rose-500 mt-0.5">{s.reason}</span>}
                          </button>
                        )
                      })}
                    </div>
                    {slots.length > 0 && !slots.some((s) => s.available) && (
                      <p className="text-sm text-rose-600 mt-2">No slots left on this date — please choose another day.</p>
                    )}
                  </>
                )}

                <Field label="Special Instructions" className="mt-5">
                  <textarea className="input-field h-20 resize-none" placeholder="Any special requests for delivery or the cake..." value={form.specialNote} onChange={(e) => update('specialNote', e.target.value)} />
                </Field>
              </div>

              <div className="card p-5 md:p-6">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">💳 Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <label key={pm.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMethod === pm.value ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-200'}`}>
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

            <div>
              <div className="card p-5 lg:sticky lg:top-24">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Order Summary</h2>
                <CartLines items={items} />

                <div className="border-t border-gray-100 pt-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type="text" placeholder="Enter code" value={coupon} onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponData(null) }} className="input-field pl-8 text-sm py-2.5" />
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

                <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                  <Row label="Subtotal" value={`₹${sub.toFixed(0)}`} />
                  {discount > 0 && <Row label="Discount" value={`-₹${discount.toFixed(0)}`} className="text-green-600" />}
                  <Row label="Delivery" value={deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`} className={deliveryFee === 0 ? 'text-green-600' : ''} />
                  {form.deliveryDate && form.deliverySlot && (
                    <Row label="Arrives" value={`${dayLabel(form.deliveryDate, now ?? undefined)}, ${slotLabel(form.deliverySlot)}`} />
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold">
                    <span>Total</span>
                    <span className="text-rose-600">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <button type="submit" disabled={submitting || !form.deliverySlot} className="btn-primary w-full mt-5 flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:hover:translate-y-0">
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

// ─── Adding to an existing order ─────────────────────────────────────────────
function AddToOrderCheckout({ target, items, cartSubtotal }: {
  target: { orderNumber: string; displayNumber: string; phone?: string }
  items: CartItem[]
  cartSubtotal: number
}) {
  const router = useRouter()
  const { clearCart, applyServerPrices } = useCartStore()
  const cancel = useAddToOrderStore((s) => s.cancel)
  const [order, setOrder] = useState<any>(null)
  const [meta, setMeta] = useState<{ canAddItems: boolean; isOwner: boolean } | null>(null)
  const [phone, setPhone] = useState(target.phone || '')
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${encodeURIComponent(target.orderNumber)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.order) return setLoadError('We couldn’t find that order.')
        setOrder(d.order)
        setMeta({ canAddItems: d.canAddItems, isOwner: d.isOwner })
      })
      .catch(() => setLoadError('Couldn’t load your order. Please try again.'))
  }, [target.orderNumber])

  const stopAdding = () => { cancel(); toast('Items stay in your cart for a new order') }

  if (loadError) {
    return (
      <Shell>
        <div className="card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <p className="font-semibold text-gray-800">{loadError}</p>
          <button onClick={stopAdding} className="btn-primary mt-5">Checkout as a new order</button>
        </div>
      </Shell>
    )
  }
  if (!order || !meta) return <Shell><div className="card p-8"><div className="h-32 skeleton rounded-xl" /></div></Shell>

  const newSubtotal = order.subtotal + cartSubtotal
  const newDeliveryFee = deliveryFeeFor(newSubtotal)
  const newTotal = newSubtotal - order.discount + newDeliveryFee
  const extraToPay = newTotal - order.total

  const submit = async () => {
    if (!meta.isOwner && !/\d{10}/.test(phone.replace(/\D/g, ''))) { toast.error('Enter the phone number used for this order'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.orderNumber)}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: toOrderLines(items), phone, expectedSubtotal: cartSubtotal }),
      })
      const data = await res.json()
      if (res.status === 409 && data.repriced) {
        applyServerPrices(data.repriced)
        toast.error(data.error, { duration: 6000 })
        return
      }
      if (!res.ok) { toast.error(data.error || 'Couldn’t add items'); return }
      clearCart()
      cancel()
      toast.success(`Added to order ${target.displayNumber} 🎉`)
      router.push(`/track-order?id=${encodeURIComponent(order.orderNumber)}`)
    } catch { toast.error('Something went wrong!') }
    finally { setSubmitting(false) }
  }

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Adding to order</p>
                <p className="font-mono font-bold text-xl text-gray-900">{target.displayNumber}</p>
                <p className="text-sm text-gray-500 mt-1">Delivering {dayLabel(order.deliveryDate)}, {slotLabel(order.deliverySlot)} · {order.city}</p>
              </div>
              <button onClick={stopAdding} className="text-sm text-gray-500 hover:text-rose-600 flex items-center gap-1"><X className="w-4 h-4" />Cancel</button>
            </div>

            {!meta.canAddItems && (
              <div className="mt-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
                This order is already being prepared (or its slot is too close), so we can’t add items to it.
                <button onClick={stopAdding} className="block mt-3 font-semibold text-rose-700 underline">Place these items as a new order</button>
              </div>
            )}

            <h3 className="font-semibold text-gray-800 mt-6 mb-3">Already in this order</h3>
            <ul className="divide-y divide-gray-100 text-sm">
              {order.items.map((i: any) => (
                <li key={i.id} className="flex justify-between py-2 text-gray-600">
                  <span>{i.productName}{i.variantName ? ` (${i.variantName})` : ''} × {i.quantity}</span>
                  <span>₹{i.total.toFixed(0)}</span>
                </li>
              ))}
            </ul>

            {!meta.isOwner && meta.canAddItems && (
              <Field label="Phone number used for this order *" className="mt-6 max-w-xs">
                <input type="tel" inputMode="numeric" className="input-field" placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
            )}
          </div>
        </div>

        <div>
          <div className="card p-5 lg:sticky lg:top-24">
            <h2 className="font-display font-bold text-xl text-gray-900 mb-4 flex items-center gap-2"><PlusCircle className="w-5 h-5 text-rose-600" />New items</h2>
            <CartLines items={items} />
            <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
              <Row label="Previous total" value={`₹${order.total.toFixed(0)}`} />
              <Row label="New items" value={`+₹${cartSubtotal.toFixed(0)}`} />
              {newDeliveryFee !== order.deliveryFee && (
                <Row label="Delivery fee" value={newDeliveryFee === 0 ? 'Now FREE' : `₹${newDeliveryFee}`} className="text-green-600" />
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold">
                <span>New total</span>
                <span className="text-rose-600">₹{newTotal.toFixed(0)}</span>
              </div>
              <p className="text-xs text-gray-500">
                {order.paymentStatus === 'PAID'
                  ? `You’ve already paid ₹${order.total.toFixed(0)}. The remaining ₹${extraToPay.toFixed(0)} will be collected on delivery.`
                  : order.paymentMethod === 'COD'
                    ? 'Pay the new total on delivery.'
                    : `The extra ₹${extraToPay.toFixed(0)} will be added to your payment for this order.`}
              </p>
            </div>
            <button onClick={submit} disabled={submitting || !meta.canAddItems} className="btn-primary w-full mt-5 flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:hover:translate-y-0">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Add to Order • +₹{extraToPay.toFixed(0)}</>}
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

// ─── Small pieces ────────────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6 md:mb-8">Add to Existing Order</h1>
        {children}
      </div>
    </div>
  )
}

function CartLines({ items }: { items: CartItem[] }) {
  return (
    <div className="space-y-3 mb-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-rose-50 shrink-0">
            <img src={item.product?.images?.[0]} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{item.product?.name}</p>
            <p className="text-xs text-gray-400 truncate">
              {[item.variant?.name, ...Object.values(item.selectedOptions || {}).filter(Boolean)].filter(Boolean).join(' · ')} × {item.quantity}
            </p>
            {item.extras.length > 0 && <p className="text-[11px] text-gray-400 truncate">+ {item.extras.map((e) => e.name).join(', ')}</p>}
          </div>
          <p className="text-sm font-bold text-gray-900">₹{lineTotal(item).toFixed(0)}</p>
        </div>
      ))}
    </div>
  )
}

function Field({ label, error, className = '', children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  )
}

function Row({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex justify-between gap-3 ${className}`}>
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  )
}
