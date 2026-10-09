import { prisma } from '@/lib/prisma'
import { bestSellerIds, cardInclude, categoryProductCounts, inCategory, toCard } from '@/lib/catalog'
import { matchesEggFilter } from '@/lib/product-utils'
import { ProductsClient } from './ProductsClient'

async function getProducts(category?: string, q?: string, egg?: string) {
  const [products, categories, counts, popular] = await Promise.all([
    prisma.product.findMany({
      where: {
        available: true,
        AND: [
          category ? inCategory(category) : {},
          q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {},
        ],
      },
      include: cardInclude,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    categoryProductCounts(),
    bestSellerIds(50),
  ])

  // The eggless toggle only makes sense when the listing contains baked items.
  const showEggFilter = products.some((p) => p.eggType !== 'NONE')

  return {
    products: products.filter((p) => matchesEggFilter(p.eggType, egg)).map(toCard),
    categories: categories.filter((c) => (counts.get(c.id) ?? 0) > 0 || c.slug === category),
    showEggFilter,
    popularIds: popular,
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; egg?: string; sort?: string }
}) {
  const egg = searchParams.egg === 'eggless' ? 'eggless' : undefined
  const data = await getProducts(searchParams.category, searchParams.q, egg)
  return (
    <ProductsClient
      {...data}
      activeCategory={searchParams.category}
      query={searchParams.q}
      egg={egg}
      initialSort={searchParams.sort}
    />
  )
}
