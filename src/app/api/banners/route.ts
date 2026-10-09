import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { bannerData } from '@/lib/banners'

export async function GET() {
  const banners = await prisma.banner.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
  return NextResponse.json({ banners })
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = bannerData(await req.json())
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const banner = await prisma.banner.create({ data: parsed.data })
  return NextResponse.json({ banner }, { status: 201 })
}
