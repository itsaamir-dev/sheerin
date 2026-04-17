import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  image?: string | null
  description?: string | null
  _count?: { products: number }
}

export function CategorySection({ categories }: { categories: Category[] }) {
  const emojis: Record<string, string> = {
    birthday: '🎂',
    wedding: '💍',
    custom: '🎨',
    photo: '📸',
  }

  const gradients: Record<string, string> = {
    birthday: 'from-rose-400 to-pink-600',
    wedding: 'from-purple-400 to-indigo-600',
    custom: 'from-amber-400 to-orange-500',
    photo: 'from-teal-400 to-cyan-600',
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Shop by Category</p>
          <h2 className="section-title">Find Your Perfect Cake</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
            >
              {/* Image */}
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=500&fit=crop'}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl mb-1">{emojis[cat.slug] || '🎂'}</p>
                    <h3 className="font-display font-bold text-white text-lg leading-tight">{cat.name}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{cat._count?.products || 0} cakes</p>
                  </div>
                  <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                    <ArrowRight className="w-4 h-4 text-white group-hover:text-gray-800 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
