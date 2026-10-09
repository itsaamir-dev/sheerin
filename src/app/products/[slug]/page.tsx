import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { cardInclude, toCard } from '@/lib/catalog'
import { parseJsonArray } from '@/lib/product-utils'
import { ProductDetailClient } from './ProductDetailClient'

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: { where: { available: true }, orderBy: { price: 'asc' } },
      options: true,
      category: true,
      categories: { select: { id: true, name: true, slug: true } },
      reviews: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!product || !product.available) notFound()

  // "You might also like": anything sharing one of this product's categories.
  const categoryIds = Array.from(new Set([product.categoryId, ...product.categories.map((c) => c.id)]))
  const related = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      available: true,
      OR: [{ categoryId: { in: categoryIds } }, { categories: { some: { id: { in: categoryIds } } } }],
    },
    include: cardInclude,
    take: 8,
  })

  return {
    product: {
      ...product,
      images: parseJsonArray<string>(product.images),
      highlights: parseJsonArray<string>(product.highlights),
      options: product.options.map((o) => ({ ...o, values: parseJsonArray(o.values) })),
    },
    related: related.map(toCard),
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug }, select: { name: true, description: true } })
  return p ? { title: `${p.name} — Sheerin`, description: p.description.slice(0, 160) } : {}
}

export default async function ProductPage({ params, searchParams }: { params: { slug: string }; searchParams: { egg?: string } }) {
  const { product, related } = await getProduct(params.slug)
  return <ProductDetailClient product={product as any} related={related} preferEggless={searchParams.egg === 'eggless'} />
}
