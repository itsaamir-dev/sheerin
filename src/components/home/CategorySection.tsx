import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { productImage } from '@/lib/product-utils'

export interface HomeCategory {
  id: string
  name: string
  slug: string
  image?: string | null
  description?: string | null
  productCount: number
}

/**
 * "Shop by Category" — round thumbnails in a row that scrolls on phones and wraps on desktop.
 * Driven entirely by the Category table, so new categories appear without code changes.
 */
export function CategorySection({ categories }: { categories: HomeCategory[] }) {
  if (categories.length === 0) return null
  return (
    <section className="py-8 md:py-12 bg-white" aria-labelledby="shop-by-category">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 md:mb-7">
          <h2 id="shop-by-category" className="font-display text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
          <Link href="/products" className="text-sm font-semibold text-rose-600 hover:text-rose-700">View all</Link>
        </div>
        <ul className="flex md:flex-wrap md:justify-center gap-4 md:gap-8 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          {categories.map((cat) => (
            <li key={cat.id} className="shrink-0">
              <Link href={`/products?category=${cat.slug}`} className="group flex flex-col items-center w-20 md:w-28 text-center">
                <span className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden ring-2 ring-rose-100 group-hover:ring-rose-400 transition-all bg-rose-50">
                  <img src={productImage(cat.image, 240)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </span>
                <span className="mt-2 text-xs md:text-sm font-semibold text-gray-800 group-hover:text-rose-600 leading-tight line-clamp-2">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** "Shop by Occasion" — larger image tiles for categories grouped as occasions. */
export function OccasionSection({ categories }: { categories: HomeCategory[] }) {
  if (categories.length === 0) return null
  return (
    <section className="py-10 md:py-14 bg-[#FDF8F3]" aria-labelledby="shop-by-occasion">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-rose-600 font-semibold text-xs uppercase tracking-widest mb-1.5">Celebrate</p>
        <h2 id="shop-by-occasion" className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-5 md:mb-7">Shop by Occasion</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-rose-100">
              <img src={productImage(cat.image, 600)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-white text-lg leading-tight">{cat.name}</h3>
                  <p className="text-white/75 text-xs mt-0.5">{cat.productCount} {cat.productCount === 1 ? 'gift' : 'gifts'}</p>
                </div>
                <span className="w-8 h-8 shrink-0 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                  <ArrowRight className="w-4 h-4 text-white group-hover:text-gray-800" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
