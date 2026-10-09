import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { categoryFormData } from '@/lib/catalog'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = categoryFormData(await req.json())
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  try {
    const category = await prisma.category.update({ where: { id: params.id }, data: parsed.data })
    return NextResponse.json({ category })
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Products only *tagged* with this category just lose the tag; products that use it
  // as their primary category must be moved first.
  const primary = await prisma.product.count({ where: { categoryId: params.id } })
  if (primary > 0)
    return NextResponse.json({ error: `${primary} product(s) use this as their main category. Change their main category first.` }, { status: 400 })
  await prisma.category.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
