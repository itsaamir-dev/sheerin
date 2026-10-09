'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard, type ProductCardProduct } from './ProductCard'

/** Titled, horizontally scrollable row of product cards (swipe on touch, arrows on desktop). */
export function ProductRail({
  eyebrow, title, products, viewAllHref, badge, tone = 'white',
}: {
  eyebrow?: string
  title: string
  products: ProductCardProduct[]
  viewAllHref?: string
  badge?: string
  tone?: 'white' | 'cream'
}) {
  const scroller = useRef<HTMLDivElement>(null)
  if (products.length === 0) return null

  const scroll = (dir: 1 | -1) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <section className={`py-10 md:py-14 ${tone === 'cream' ? 'bg-[#FDF8F3]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-7">
          <div>
            {eyebrow && <p className="text-rose-600 font-semibold text-xs uppercase tracking-widest mb-1.5">{eyebrow}</p>}
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {viewAllHref && (
              <Link href={viewAllHref} className="text-sm font-semibold text-rose-600 hover:text-rose-700 mr-1">View all</Link>
            )}
            <button onClick={() => scroll(-1)} aria-label="Scroll left" className="hidden md:flex w-9 h-9 rounded-full border border-gray-200 bg-white items-center justify-center hover:border-rose-300 hover:text-rose-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} aria-label="Scroll right" className="hidden md:flex w-9 h-9 rounded-full border border-gray-200 bg-white items-center justify-center hover:border-rose-300 hover:text-rose-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth scroll-px-4 sm:scroll-px-0 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar"
        >
          {products.map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-[46%] sm:w-[31%] lg:w-[calc(25%-15px)]">
              <ProductCard product={p} badge={badge} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
