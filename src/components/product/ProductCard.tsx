'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Heart, Star, Truck } from 'lucide-react'
import { avgRating, minPrice, productImage } from '@/lib/product-utils'
import { getEarliestDelivery } from '@/lib/delivery'
import { useDeliveryClock } from '@/hooks/useDeliveryClock'
import { EggMark } from './EggBadge'

export interface ProductCardProduct {
  id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
  eggType?: string
  featured?: boolean
  category?: { name: string } | null
  variants: { price: number; available?: boolean }[]
  reviews: { rating: number }[]
}

/**
 * Gifting-style product card: square, edge-to-edge photo (second photo on hover),
 * name, price, rating chip and earliest delivery — the information shoppers scan for.
 */
export function ProductCard({ product, badge, href }: { product: ProductCardProduct; badge?: string; href?: string }) {
  const [liked, setLiked] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  // A cached image can finish loading before React hydrates, so onLoad never fires — check on mount too.
  useEffect(() => { if (imgRef.current?.complete) setLoaded(true) }, [])
  const now = useDeliveryClock()
  const earliest = now ? getEarliestDelivery(now) : null
  const rating = avgRating(product.reviews)
  const link = href || `/products/${product.slug}`
  const [first, second] = product.images

  return (
    <Link href={link} className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      <div className={`relative aspect-square overflow-hidden ${loaded ? 'bg-rose-50' : 'skeleton'}`}>
        <img
          ref={imgRef}
          src={productImage(first, 480)}
          srcSet={`${productImage(first, 320)} 320w, ${productImage(first, 480)} 480w, ${productImage(first, 720)} 720w`}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04] ${loaded ? 'opacity-100' : 'opacity-0'} ${second ? 'group-hover:opacity-0' : ''}`}
        />
        {second && (
          <img
            src={productImage(second, 480)}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {(badge || product.featured) && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wide bg-white/95 text-rose-600 px-2 py-1 rounded-md shadow-sm">
            {badge || 'Bestseller'}
          </span>
        )}
        <button
          type="button"
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => { e.preventDefault(); setLiked((v) => !v) }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
        </button>
      </div>

      <div className="p-3 sm:p-3.5">
        <div className="flex items-start gap-1.5">
          {product.eggType && <EggMark eggType={product.eggType} className="mt-0.5 shrink-0" />}
          <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem] font-sans">{product.name}</h3>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="font-bold text-gray-900 text-base">₹{minPrice(product).toFixed(0)}</p>
          {product.reviews.length > 0 && (
            <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              {rating.toFixed(1)} <Star className="w-2.5 h-2.5 fill-white" />
              <span className="font-normal opacity-90 ml-0.5">({product.reviews.length})</span>
            </span>
          )}
        </div>

        <p className="mt-2 text-[11px] text-gray-500 flex items-center gap-1 min-h-[1rem]">
          {earliest && (
            <>
              <Truck className="w-3 h-3 text-green-600 shrink-0" />
              Earliest delivery: <span className={`font-semibold ${earliest.label === 'Today' ? 'text-green-700' : 'text-gray-700'}`}>{earliest.label}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 skeleton rounded w-4/5" />
        <div className="h-4 skeleton rounded w-1/3" />
        <div className="h-3 skeleton rounded w-1/2" />
      </div>
    </div>
  )
}
