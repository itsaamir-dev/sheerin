import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await req.json()
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(body.available !== undefined && { available: body.available }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.basePrice && { basePrice: body.basePrice }),
      },
    })
    return NextResponse.json({ product })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true, options: true, category: true, reviews: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    product: { ...product, images: JSON.parse(product.images as string) },
  })
}
