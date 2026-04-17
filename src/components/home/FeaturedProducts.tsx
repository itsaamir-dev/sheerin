'use client'
import Link from 'next/link'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { useState } from 'react'

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
  category?: { name: string }
  variants: { name: string; price: number }[]
  reviews: { rating: number }[]
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  const toggleWish = (id: string) => {
    setWishlist((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const avgRating = (reviews: { rating: number }[]) => {
    if (!reviews.length) return 5
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
  }

  return (
    <section className="py-20 bg-[#FDF8F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Top Picks</p>
            <h2 className="section-title">Bestselling Cakes</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-rose-600 font-semibold text-sm hover:gap-3 transition-all">
            View all <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const minPrice = product.variants.length
              ? Math.min(...product.variants.map((v) => v.price))
              : product.basePrice

            return (
              <div key={product.id} className="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative overflow-hidden aspect-square bg-rose-50">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWish(product.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        wishlist.has(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'
                      }`}
                    />
                  </button>

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="badge bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
                      {product.category?.name}
                    </span>
                  </div>

                  {/* Quick add overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Link
                      href={`/products/${product.slug}`}
                      className="btn-primary w-full text-center text-sm flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Customize & Order
                    </Link>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-gray-700">{avgRating(product.reviews)}</span>
                    <span className="text-xs text-gray-400">({product.reviews.length} reviews)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400">Starting from</span>
                      <p className="font-bold text-rose-600 text-lg">₹{minPrice.toFixed(0)}</p>
                    </div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="w-10 h-10 bg-rose-50 hover:bg-rose-600 rounded-full flex items-center justify-center transition-all group/btn"
                    >
                      <ShoppingCart className="w-4 h-4 text-rose-600 group-hover/btn:text-white transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/products" className="btn-secondary inline-flex">
            View All Cakes
          </Link>
        </div>
      </div>
    </section>
  )
}
