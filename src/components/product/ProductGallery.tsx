'use client'
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { productImage } from '@/lib/product-utils'

/**
 * Product photo gallery: vertical thumbnails + hover-zoom on desktop,
 * swipeable full-width photos with dots on phones.
 */
export function ProductGallery({ images, name, overlay }: { images: string[]; name: string; overlay?: React.ReactNode }) {
  const photos = images.length ? images : ['']
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const touchX = useRef<number | null>(null)
  const go = (i: number) => setIndex((i + photos.length) % photos.length)

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 lg:gap-4 lg:sticky lg:top-24">
      {photos.length > 1 && (
        <div className="hidden lg:flex lg:flex-col gap-3 shrink-0" role="tablist" aria-label="Product photos">
          {photos.map((img, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={index === i}
              aria-label={`Photo ${i + 1}`}
              onMouseEnter={() => setIndex(i)}
              onClick={() => setIndex(i)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${index === i ? 'border-rose-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={productImage(img, 160)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1">
        <div
          className="relative rounded-2xl overflow-hidden aspect-square bg-rose-50 lg:cursor-zoom-in"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
          }}
          onMouseLeave={() => setZoom(null)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
            touchX.current = null
          }}
        >
          {photos.map((img, i) => (
            <img
              key={i}
              src={productImage(img, 1000)}
              srcSet={`${productImage(img, 600)} 600w, ${productImage(img, 1000)} 1000w, ${productImage(img, 1400)} 1400w`}
              sizes="(min-width: 1024px) 45vw, 100vw"
              alt={i === 0 ? name : `${name} — photo ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === index ? 'opacity-100' : 'opacity-0'}`}
              style={
                i === index && zoom
                  ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
          ))}
          {overlay}

          {photos.length > 1 && (
            <>
              <button onClick={() => go(index - 1)} aria-label="Previous photo"
                className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 rounded-full flex items-center justify-center shadow">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => go(index + 1)} aria-label="Next photo"
                className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 rounded-full flex items-center justify-center shadow">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
