import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { categoryFormData, categoryProductCounts } from '@/lib/catalog'

export async function GET() {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    categoryProductCounts(),
  ])
  return NextResponse.json({ categories: categories.map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 })) })
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = categoryFormData(await req.json())
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  try {
    const category = await prisma.category.create({ data: parsed.data })
    return NextResponse.json({ category }, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
