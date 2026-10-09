import { prisma } from '@/lib/prisma'
import { categoryProductCounts } from '@/lib/catalog'
import { AdminCategoriesClient } from './AdminCategoriesClient'

export default async function AdminCategoriesPage() {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    categoryProductCounts(),
  ])
  return (
    <AdminCategoriesClient
      categories={categories.map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }))}
    />
  )
}
