import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileClient } from './ProfileClient'

export const metadata = { title: 'My Profile — Sheerin' }

export default async function ProfilePage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth?redirect=/profile')

  const [dbUser, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!dbUser) redirect('/auth')

  return <ProfileClient user={dbUser} orders={orders} />
}
