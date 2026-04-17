import { prisma } from '@/lib/prisma'
import { AdminProductsClient } from './AdminProductsClient'

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, variants: true, _count: { select: { reviews: true, orderItems: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany(),
  ])

  return (
    <AdminProductsClient
      products={products.map((p) => ({ ...p, images: JSON.parse(p.images as string) }))}
      categories={categories}
    />
  )
}
