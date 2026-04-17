import { prisma } from '@/lib/prisma'
import { AdminCategoriesClient } from './AdminCategoriesClient'

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
  return <AdminCategoriesClient categories={categories} />
}
