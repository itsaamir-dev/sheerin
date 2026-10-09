import { prisma } from '@/lib/prisma'
import { parseJsonArray } from '@/lib/product-utils'
import { AdminProductsClient } from './AdminProductsClient'

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        categories: { select: { id: true, name: true } },
        variants: true,
        _count: { select: { reviews: true, orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
  ])

  return (
    <AdminProductsClient
      products={products.map((p) => ({ ...p, images: parseJsonArray<string>(p.images), highlights: parseJsonArray<string>(p.highlights) }))}
      categories={categories}
    />
  )
}
