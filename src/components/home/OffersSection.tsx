'use client'
import { useState } from 'react'
import { Check, Copy, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

export interface Offer {
  id: string
  code: string
  type: string
  value: number
  minOrderValue: number
  expiresAt: string | null
}

const TONES = ['from-rose-500 to-pink-600', 'from-amber-400 to-orange-500', 'from-violet-500 to-indigo-600', 'from-emerald-500 to-teal-600']

/** Coupons an admin has marked "show on homepage". */
export function OffersSection({ offers }: { offers: Offer[] }) {
  const [copied, setCopied] = useState<string | null>(null)
  if (offers.length === 0) return null

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      toast.success(`Code ${code} copied — apply it at checkout`)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast(`Use code ${code} at checkout`)
    }
  }

  return (
    <section className="py-10 md:py-14 bg-white" aria-labelledby="offers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-rose-600 font-semibold text-xs uppercase tracking-widest mb-1.5">Save more</p>
        <h2 id="offers" className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-5 md:mb-7">Offers for You</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x scroll-px-4 sm:scroll-px-0 -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          {offers.map((o, i) => (
            <div key={o.id} className={`snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[calc(33.333%-11px)] rounded-2xl bg-gradient-to-br ${TONES[i % TONES.length]} text-white p-5 relative overflow-hidden`}>
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
              <Tag className="w-5 h-5 opacity-80" />
              <p className="font-display text-3xl font-bold mt-2">
                {o.type === 'PERCENTAGE' ? `${o.value}% OFF` : `₹${o.value} OFF`}
              </p>
              <p className="text-sm text-white/85 mt-1">
                {o.minOrderValue > 0 ? `On orders above ₹${o.minOrderValue}` : 'On any order'}
                {o.expiresAt && ` · till ${new Date(o.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
              </p>
              <button onClick={() => copy(o.code)}
                className="mt-4 inline-flex items-center gap-2 bg-white/95 text-gray-900 font-mono font-bold text-sm pl-3 pr-2 py-1.5 rounded-lg border-2 border-dashed border-white/60 hover:bg-white transition-colors">
                {o.code}
                {copied === o.code ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
