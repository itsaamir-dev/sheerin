'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { EggMark } from '@/components/product/EggBadge'
import { avgRating, minPrice } from '@/lib/product-utils'
import type { ProductCardData } from '@/lib/catalog'

interface Category { id: string; name: string; slug: string; description?: string | null }

const SORTS = [
  { value: 'default', label: 'Recommended' },
  { value: 'popular', label: 'Popularity' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export function ProductsClient({
  products, categories, activeCategory, query, egg, showEggFilter, popularIds, initialSort,
}: {
  products: ProductCardData[]
  categories: Category[]
  activeCategory?: string
  query?: string
  egg?: string
  showEggFilter: boolean
  popularIds: string[]
  initialSort?: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(query || '')
  const [sort, setSort] = useState(SORTS.some((s) => s.value === initialSort) ? initialSort! : 'default')

  const navigate = (next: { category?: string | null; q?: string | null; egg?: string | null }) => {
    const params = new URLSearchParams()
    const category = next.category !== undefined ? next.category : activeCategory
    const q = next.q !== undefined ? next.q : query
    const eggValue = next.egg !== undefined ? next.egg : egg
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (eggValue) params.set('egg', eggValue)
    if (sort !== 'default') params.set('sort', sort)
    router.push(`/products${params.size ? `?${params}` : ''}`)
  }

  const rank = (id: string) => {
    const i = popularIds.indexOf(id)
    return i === -1 ? Number.MAX_SAFE_INTEGER : i
  }
  const sorted = [...products].sort((a, b) => {
    switch (sort) {
      case 'price-asc': return minPrice(a) - minPrice(b)
      case 'price-desc': return minPrice(b) - minPrice(a)
      case 'rating': return avgRating(b.reviews) - avgRating(a.reviews)
      case 'popular': return rank(a.id) - rank(b.id)
      case 'newest': return b.createdAt.localeCompare(a.createdAt)
      default: return 0
    }
  })

  const active = categories.find((c) => c.slug === activeCategory)
  const title = active?.name || (query ? `Results for “${query}”` : 'All Cakes & Gifts')

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-16 lg:pt-20">
      {/* Header */}
      <div className="bg-white border-b border-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-gray-500 text-sm">
            {active?.description ? `${active.description} · ` : ''}{products.length} {products.length === 1 ? 'item' : 'items'}
          </p>

          <form onSubmit={(e) => { e.preventDefault(); navigate({ q: search.trim() || null }) }} className="mt-5 flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search cakes, flavours…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
            </div>
            <button type="submit" className="btn-primary px-5">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Category pills: one scrollable row on phones */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap pb-1 mb-4">
          <Pill active={!activeCategory} onClick={() => navigate({ category: null })}>All</Pill>
          {categories.map((cat) => (
            <Pill key={cat.id} active={activeCategory === cat.slug} onClick={() => navigate({ category: cat.slug })}>{cat.name}</Pill>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {showEggFilter ? (
            <button
              type="button"
              role="switch"
              aria-checked={egg === 'eggless'}
              onClick={() => navigate({ egg: egg === 'eggless' ? null : 'eggless' })}
              className={`inline-flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
                egg === 'eggless' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-white border-gray-200 text-gray-700 hover:border-green-400'
              }`}
            >
              <span className={`relative w-8 h-5 rounded-full transition-colors ${egg === 'eggless' ? 'bg-green-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${egg === 'eggless' ? 'left-3.5' : 'left-0.5'}`} />
              </span>
              <EggMark eggType="EGGLESS" small decorative /> Eggless only
            </button>
          ) : <span />}

          <label className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
            </select>
          </label>
        </div>

        {(query || egg) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {query && <Chip onClear={() => { setSearch(''); navigate({ q: null }) }}>Search: “{query}”</Chip>}
            {egg && <Chip onClear={() => navigate({ egg: null })}>Eggless only</Chip>}
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-2xl font-bold text-gray-700 mb-2">Nothing found</h3>
            <p className="text-gray-400 mb-6">Try a different search, category or filter</p>
            <button onClick={() => router.push('/products')} className="btn-primary">View Everything</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {sorted.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                // Carry the eggless choice through to the product page so it's preselected there.
                href={egg ? `/products/${product.slug}?egg=eggless` : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
      }`}
    >
      {children}
    </button>
  )
}

function Chip({ onClear, children }: { onClear: () => void; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full">
      {children}
      <button onClick={onClear} aria-label="Clear filter"><X className="w-3 h-3" /></button>
    </span>
  )
}
