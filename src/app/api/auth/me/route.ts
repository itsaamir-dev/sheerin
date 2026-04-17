import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ user: null }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: { id: true, name: true, email: true, role: true },
    })
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
