'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Star, ShoppingCart, SlidersHorizontal, Heart, X } from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; basePrice: number; images: string[]
  category?: { name: string; slug: string }; variants: { price: number }[]
  reviews: { rating: number }[]; featured: boolean
}
interface Category { id: string; name: string; slug: string }

export function ProductsClient({
  products, categories, activeCategory, query
}: {
  products: Product[]; categories: Category[]
  activeCategory?: string; query?: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(query || '')
  const [sort, setSort] = useState('default')
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (activeCategory) params.set('category', activeCategory)
    router.push(`/products?${params.toString()}`)
  }

  const handleCategory = (slug: string) => {
    const params = new URLSearchParams()
    if (slug !== 'all') params.set('category', slug)
    if (search) params.set('q', search)
    router.push(`/products?${params.toString()}`)
  }

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price-asc') return a.basePrice - b.basePrice
    if (sort === 'price-desc') return b.basePrice - a.basePrice
    if (sort === 'rating') {
      const ra = a.reviews.length ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length : 0
      const rb = b.reviews.length ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 0
      return rb - ra
    }
    return 0
  })

  const avgRating = (reviews: { rating: number }[]) =>
    reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0'

  const toggleWish = (id: string) => {
    setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-24">
      {/* Header */}
      <div className="bg-white border-b border-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Our Cakes</h1>
          <p className="text-gray-500">{products.length} cakes available for delivery</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cakes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary px-5">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeCategory ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-gray-600 border hover:border-rose-300'
              }`}
            >
              All Cakes
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.slug ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-gray-600 border hover:border-rose-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Active filters */}
        {(activeCategory || query) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeCategory && (
              <span className="flex items-center gap-1.5 bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                Category: {categories.find((c) => c.slug === activeCategory)?.name}
                <button onClick={() => handleCategory('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {query && (
              <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                Search: "{query}"
                <button onClick={() => router.push('/products')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-2xl font-bold text-gray-700 mb-2">No cakes found</h3>
            <p className="text-gray-400 mb-6">Try a different search or category</p>
            <button onClick={() => router.push('/products')} className="btn-primary">View All Cakes</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sorted.map((product) => {
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
                    <button
                      onClick={() => toggleWish(product.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-all"
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlist.has(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                    </button>
                    {product.featured && (
                      <div className="absolute top-2 left-2">
                        <span className="badge bg-amber-400 text-amber-900 text-[10px]">⭐ Bestseller</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Link href={`/products/${product.slug}`} className="btn-primary w-full text-center text-xs flex items-center justify-center gap-1 py-2">
                        <ShoppingCart className="w-3.5 h-3.5" /> Customize & Order
                      </Link>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-xs text-rose-500 font-medium mb-0.5">{product.category?.name}</p>
                    <h3 className="font-display font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                    <div className="flex items-center gap-1 my-1.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold">{avgRating(product.reviews)}</span>
                      <span className="text-xs text-gray-400">({product.reviews.length})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400">From</p>
                        <p className="font-bold text-rose-600">₹{minPrice.toFixed(0)}</p>
                      </div>
                      <Link href={`/products/${product.slug}`} className="w-8 h-8 bg-rose-50 hover:bg-rose-600 rounded-full flex items-center justify-center transition-all group/btn">
                        <ShoppingCart className="w-3.5 h-3.5 text-rose-600 group-hover/btn:text-white transition-colors" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
