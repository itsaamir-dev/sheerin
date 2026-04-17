import { prisma } from '@/lib/prisma'
import { ProductsClient } from './ProductsClient'

async function getProducts(category?: string, q?: string) {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        available: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
      },
      include: {
        variants: true,
        category: true,
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany(),
  ])

  return {
    products: products.map((p) => ({
      ...p,
      images: JSON.parse(p.images as string),
    })),
    categories,
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const { products, categories } = await getProducts(searchParams.category, searchParams.q)
  return <ProductsClient products={products} categories={categories} activeCategory={searchParams.category} query={searchParams.q} />
}
