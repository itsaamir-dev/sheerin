'use client'
import { Clock, Gift, ShieldCheck, Truck } from 'lucide-react'
import { DELIVERY_CONFIG, sameDayTimeLeft } from '@/lib/delivery'
import { useDeliveryClock } from '@/hooks/useDeliveryClock'

/** Trust strip with a live same-day countdown driven by the shared delivery rules. */
export function DeliveryPromise() {
  const now = useDeliveryClock()
  const left = now ? sameDayTimeLeft(now) : null

  const items = [
    {
      icon: Clock,
      title: left ? 'Same-day delivery' : 'Next-day delivery',
      text: now
        ? left
          ? `Order within ${left.hours ? `${left.hours}h ` : ''}${left.minutes}m`
          : 'Same-day orders closed for today'
        : `Order before ${DELIVERY_CONFIG.sameDayCutoffHour > 12 ? DELIVERY_CONFIG.sameDayCutoffHour - 12 : DELIVERY_CONFIG.sameDayCutoffHour} PM`,
      highlight: Boolean(left),
    },
    { icon: Truck, title: 'Free delivery', text: `On orders above ₹${DELIVERY_CONFIG.freeDeliveryThreshold}` },
    { icon: Gift, title: 'Personalised', text: 'Message, candles & card' },
    { icon: ShieldCheck, title: 'Baked fresh', text: 'No preservatives' },
  ]

  return (
    <section className="bg-white border-y border-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {items.map(({ icon: Icon, title, text, highlight }) => (
          <div key={title} className="flex items-center gap-3">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${highlight ? 'bg-green-50' : 'bg-rose-50'}`}>
              <Icon className={`w-5 h-5 ${highlight ? 'text-green-600' : 'text-rose-600'}`} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
              <p className={`text-xs leading-tight mt-0.5 ${highlight ? 'text-green-700 font-medium' : 'text-gray-500'}`}>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
