'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusCircle, X } from 'lucide-react'
import { useAddToOrderStore, useCartStore } from '@/lib/cart-store'

/** Persistent reminder while the shopper is picking items to add to an existing order. */
export function AddToOrderBar() {
  const path = usePathname()
  const { target, cancel } = useAddToOrderStore()
  const count = useCartStore((s) => s.totalItems())
  if (!target || path.startsWith('/admin') || path === '/checkout') return null

  return (
    <div className="fixed bottom-16 lg:bottom-4 inset-x-3 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[560px] z-40">
      <div className="flex items-center gap-3 bg-gray-900 text-white rounded-2xl shadow-2xl px-4 py-3">
        <PlusCircle className="w-5 h-5 text-rose-400 shrink-0" />
        <p className="text-sm flex-1 min-w-0">
          Adding to order <span className="font-mono font-bold">{target.displayNumber}</span>
          <span className="text-white/60"> · {count} item{count === 1 ? '' : 's'} selected</span>
        </p>
        <Link href="/checkout" className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-3.5 py-1.5 rounded-full shrink-0">
          Review
        </Link>
        <button onClick={cancel} aria-label="Stop adding to this order" className="text-white/60 hover:text-white shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/** Button that switches the cart into "add to this order" mode and sends the shopper to the catalogue. */
export function AddProductsButton({ orderNumber, displayNumber, phone, className = '' }: {
  orderNumber: string; displayNumber: string; phone?: string; className?: string
}) {
  const start = useAddToOrderStore((s) => s.start)
  return (
    <Link
      href="/products"
      onClick={() => start({ orderNumber, displayNumber, phone })}
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      <PlusCircle className="w-4 h-4" /> Add More Products
    </Link>
  )
}
