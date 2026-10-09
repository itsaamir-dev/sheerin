import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { cardInclude, inCategory, productFormData, toCard } from '@/lib/catalog'
import { matchesEggFilter } from '@/lib/product-utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const q = searchParams.get('q')
  const featured = searchParams.get('featured')
  const egg = searchParams.get('egg') || undefined

  const products = await prisma.product.findMany({
    where: {
      available: true,
      AND: [
        category ? inCategory(category) : {},
        q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {},
      ],
      ...(featured ? { featured: true } : {}),
    },
    include: cardInclude,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ products: products.filter((p) => matchesEggFilter(p.eggType, egg)).map(toCard) })
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = productFormData(await req.json())
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { categoryIds, variants, images, highlights, ...data } = parsed.data

  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        images: JSON.stringify(images),
        highlights: JSON.stringify(highlights),
        categories: { connect: categoryIds.map((id) => ({ id })) },
        variants: { create: variants },
      },
    })

    // New cakes get the same customisation options as the rest of the catalogue.
    if (data.eggType !== 'NONE') {
      await prisma.productOption.createMany({
        data: [
          { productId: product.id, name: 'Flavor', type: 'SELECT', required: true, values: JSON.stringify(DEFAULT_FLAVORS) },
          { productId: product.id, name: 'Egg Type', type: 'SELECT', required: true, values: JSON.stringify([{ label: 'Egg', priceAdd: 0 }, { label: 'Eggless', priceAdd: 50 }]) },
          { productId: product.id, name: 'Message on Cake', type: 'TEXT', required: false, values: '[]' },
        ],
      })
    }

    return NextResponse.json({ product })
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'A product with this name already exists' }, { status: 400 })
    console.error('Create product error:', e)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

const DEFAULT_FLAVORS = [
  { label: 'Chocolate', priceAdd: 0 },
  { label: 'Vanilla', priceAdd: 0 },
  { label: 'Strawberry', priceAdd: 0 },
  { label: 'Red Velvet', priceAdd: 100 },
  { label: 'Butterscotch', priceAdd: 50 },
]
