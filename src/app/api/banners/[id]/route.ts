import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { bannerData } from '@/lib/banners'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  // Quick toggle from the list view
  if (Object.keys(body).length === 1 && typeof body.active === 'boolean') {
    const banner = await prisma.banner.update({ where: { id: params.id }, data: { active: body.active } })
    return NextResponse.json({ banner })
  }
  const parsed = bannerData(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const banner = await prisma.banner.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json({ banner })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await prisma.banner.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
