'use client'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Slide {
  id: string
  heading: string
  description?: string | null
  image: string
  ctaLabel?: string | null
  ctaUrl?: string | null
}

// Shown until an admin adds banners in /admin/banners.
const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'default-1',
    heading: 'Fresh Cakes, Delivered Today',
    description: 'Order before 2 PM for same-day delivery. Baked fresh, customised your way.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&q=80&auto=format&fit=crop',
    ctaLabel: 'Order Now',
    ctaUrl: '/products',
  },
  {
    id: 'default-2',
    heading: 'Our Most-Loved Cakes',
    description: 'Hand-crafted favourites, personalised with your message, candles and a greeting card.',
    image: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=1600&q=80&auto=format&fit=crop',
    ctaLabel: 'Shop Bestsellers',
    ctaUrl: '/products?sort=popular',
  },
  {
    id: 'default-3',
    heading: '100% Eggless? Absolutely.',
    description: 'Every classic is available eggless — same taste, same love.',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1600&q=80&auto=format&fit=crop',
    ctaLabel: 'Browse Eggless',
    ctaUrl: '/products?egg=eggless',
  },
]

const AUTOPLAY_MS = 5500

export function HeroSlider({ banners }: { banners: Slide[] }) {
  const slides = banners.length ? banners : DEFAULT_SLIDES
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const count = slides.length

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])

  useEffect(() => {
    if (paused || count < 2) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => go(index + 1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [index, paused, count, go])

  return (
    <section
      className="relative pt-16 lg:pt-20 bg-[#FDF8F3]"
      aria-roledescription="carousel"
      aria-label="Promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1)
        if (e.key === 'ArrowRight') go(index + 1)
      }}
    >
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 sm:pt-4">
        <div
          className="relative overflow-hidden sm:rounded-3xl aspect-[4/5] sm:aspect-[16/8] lg:aspect-[16/6] bg-rose-100"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
            touchX.current = null
          }}
        >
          <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
            {slides.map((s, i) => (
              <div
                key={s.id}
                className="relative w-full h-full shrink-0"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i !== index}
              >
                <img
                  src={s.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:right-auto flex flex-col justify-end sm:justify-center p-6 pb-14 sm:p-12 lg:p-16 max-w-xl">
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">{s.heading}</h2>
                  {s.description && <p className="text-white/85 text-sm sm:text-base lg:text-lg mt-3 max-w-md">{s.description}</p>}
                  {s.ctaUrl && (
                    <Link href={s.ctaUrl} tabIndex={i === index ? 0 : -1} className="btn-primary self-start mt-5 sm:mt-7 text-sm sm:text-base">
                      {s.ctaLabel || 'Shop Now'}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {count > 1 && (
            <>
              <button onClick={() => go(index - 1)} aria-label="Previous slide"
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 hover:bg-white items-center justify-center shadow-md transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button onClick={() => go(index + 1)} aria-label="Next slide"
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 hover:bg-white items-center justify-center shadow-md transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((s, i) => (
                  <button key={s.id} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`} aria-current={i === index}
                    className={`h-2 rounded-full transition-all ${i === index ? 'w-7 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
