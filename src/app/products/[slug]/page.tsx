import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './ProductDetailClient'

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      options: true,
      category: true,
      reviews: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, available: true },
    include: { variants: true },
    take: 4,
  })

  return {
    product: {
      ...product,
      images: JSON.parse(product.images as string) as string[],
      options: product.options.map((o) => ({
        ...o,
        values: JSON.parse(o.values as string),
      })),
    },
    related: related.map((r) => ({ ...r, images: JSON.parse(r.images as string) })),
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { product, related } = await getProduct(params.slug)
  return <ProductDetailClient product={product as any} related={related as any} />
}
