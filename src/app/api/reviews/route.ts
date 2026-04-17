import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, name, rating, comment } = body

    if (!productId || !name || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
    }

    const user = await getAuthUser()

    const review = await prisma.review.create({
      data: {
        productId,
        name,
        rating: parseInt(rating),
        comment,
        userId: user?.id || null,
      },
    })
    return NextResponse.json({ review }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')

  const reviews = await prisma.review.findMany({
    where:   productId ? { productId } : {},
    orderBy: { createdAt: 'desc' },
    take:    50,
  })
  return NextResponse.json({ reviews })
}
