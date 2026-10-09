import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { EGG_TYPES, parseJsonArray, slugify } from '@/lib/product-utils'

// Server-side catalogue queries. A product appears in a category if it's either its primary
// category or one of its additional categories (many-to-many).

export const inCategory = (slug: string): Prisma.ProductWhereInput => ({
  OR: [{ category: { slug } }, { categories: { some: { slug } } }],
})

export const cardInclude = {
  variants: { select: { id: true, name: true, price: true, available: true } },
  category: { select: { name: true, slug: true } },
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductInclude

type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>

/** Plain, client-safe shape for product cards. */
export function toCard(p: CardRow) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    images: parseJsonArray<string>(p.images),
    eggType: p.eggType,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
    category: p.category,
    variants: p.variants,
    reviews: p.reviews,
  }
}
export type ProductCardData = ReturnType<typeof toCard>

/** Number of available products listed in each category (primary or additional). */
export async function categoryProductCounts() {
  const rows = await prisma.$queryRaw<{ id: string; n: number }[]>`
    SELECT c.id, COUNT(DISTINCT p.id)::int AS n
    FROM "Category" c
    LEFT JOIN "_ProductCategories" pc ON pc."A" = c.id
    LEFT JOIN "Product" p ON p.available AND (p."categoryId" = c.id OR p.id = pc."B")
    GROUP BY c.id`
  return new Map(rows.map((r) => [r.id, r.n]))
}

/** Best sellers by units ordered (cancelled orders excluded), topped up with featured products. */
export async function bestSellerIds(limit: number) {
  const rows = await prisma.$queryRaw<{ productId: string }[]>`
    SELECT oi."productId"
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId" AND o.status <> 'CANCELLED'
    JOIN "Product" p ON p.id = oi."productId" AND p.available
    GROUP BY oi."productId"
    ORDER BY SUM(oi.quantity) DESC
    LIMIT ${limit}`
  return rows.map((r) => r.productId)
}

/** Validates the admin product form body for create (partial = false) or update. */
export function productFormData(body: any) {
  const name = String(body.name ?? '').trim()
  const categoryIds: string[] = Array.isArray(body.categoryIds) ? body.categoryIds.filter((x: unknown) => typeof x === 'string') : []
  const primary = typeof body.categoryId === 'string' && body.categoryId ? body.categoryId : categoryIds[0]
  if (!name) return { error: 'Product name is required' }
  if (!primary) return { error: 'Choose at least one category' }
  const basePrice = Number(body.basePrice)
  if (!(basePrice >= 0)) return { error: 'Enter a valid base price' }
  const eggType = EGG_TYPES.includes(body.eggType) ? body.eggType : 'BOTH'
  const highlights = parseJsonArray<string>(body.highlights).map((h) => String(h).trim()).filter(Boolean).slice(0, 10)
  const variants: { name: string; price: number }[] = (Array.isArray(body.variants) ? body.variants : [])
    .filter((v: any) => String(v?.name ?? '').trim() && Number(v?.price) > 0)
    .map((v: any) => ({ name: String(v.name).trim(), price: Number(v.price) }))

  return {
    data: {
      name,
      slug: slugify(name),
      description: String(body.description ?? '').trim(),
      basePrice,
      images: parseJsonArray<string>(body.images).filter((s) => typeof s === 'string' && s),
      highlights,
      careInstructions: String(body.careInstructions ?? '').trim() || null,
      eggType,
      categoryId: primary,
      categoryIds: Array.from(new Set([primary, ...categoryIds])),
      featured: Boolean(body.featured),
      available: body.available !== false,
      variants,
    },
  }
}

export const CATEGORY_GROUPS = ['TYPE', 'OCCASION', 'FLAVOUR'] as const

export function categoryFormData(body: any) {
  const name = String(body.name ?? '').trim()
  if (!name) return { error: 'Category name is required' }
  return {
    data: {
      name,
      slug: slugify(String(body.slug || name)),
      description: String(body.description ?? '').trim() || null,
      image: String(body.image ?? '').trim() || null,
      group: CATEGORY_GROUPS.includes(body.group) ? body.group : 'TYPE',
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : 0,
      showOnHome: body.showOnHome !== false,
    },
  }
}
