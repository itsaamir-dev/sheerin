import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const q = searchParams.get('q')
  const featured = searchParams.get('featured')

  const products = await prisma.product.findMany({
    where: {
      available: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(featured ? { featured: true } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
    },
    include: { variants: true, category: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      images: JSON.parse(p.images as string),
    })),
  })
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: body.description,
        basePrice: body.basePrice,
        images: JSON.stringify(body.images || []),
        categoryId: body.categoryId,
        featured: body.featured || false,
        available: body.available !== false,
      },
    })

    // Create default variants
    if (body.variants?.length) {
      await prisma.productVariant.createMany({
        data: body.variants.map((v: any) => ({ ...v, productId: product.id })),
      })
    }

    return NextResponse.json({ product })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 })
  }
}
