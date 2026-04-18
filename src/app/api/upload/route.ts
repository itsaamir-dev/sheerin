import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ error: 'Only JPG, PNG, WebP, GIF allowed' }, { status: 400 })

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    await writeFile(join(uploadDir, filename), Buffer.from(bytes))

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
