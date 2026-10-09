import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { productFormData } from '@/lib/catalog'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()

  // Quick toggles from the product grid
  if (!('name' in body)) {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(typeof body.available === 'boolean' && { available: body.available }),
        ...(typeof body.featured === 'boolean' && { featured: body.featured }),
      },
    })
    return NextResponse.json({ product })
  }

  // Full edit
  const parsed = productFormData(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { categoryIds, variants, images, highlights, slug: _slug, ...data } = parsed.data

  try {
    const product = await prisma.$transaction(async (tx) => {
      // Order items keep their own name/size snapshot, so variants can be replaced safely;
      // carts holding an old variant id are re-matched by name at checkout.
      if (variants.length) {
        await tx.productVariant.deleteMany({ where: { productId: params.id } })
        await tx.productVariant.createMany({ data: variants.map((v) => ({ ...v, productId: params.id })) })
      }
      return tx.product.update({
        where: { id: params.id },
        data: {
          ...data,
          images: JSON.stringify(images),
          highlights: JSON.stringify(highlights),
          categories: { set: categoryIds.map((id) => ({ id })) },
        },
      })
    })
    return NextResponse.json({ product })
  } catch (e: any) {
    console.error('Update product error:', e)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const ordered = await prisma.orderItem.count({ where: { productId: params.id } })
  if (ordered > 0)
    return NextResponse.json({ error: 'This product has orders, so it can’t be deleted. Hide it instead.' }, { status: 400 })
  await prisma.$transaction([
    prisma.review.deleteMany({ where: { productId: params.id } }),
    prisma.product.delete({ where: { id: params.id } }),
  ])
  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true, options: true, category: true, categories: true, reviews: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    product: { ...product, images: JSON.parse(product.images as string) },
  })
}
