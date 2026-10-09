import { prisma } from '@/lib/prisma'
import { pushConfigured } from '@/lib/push'
import { AdminNotificationsClient } from './AdminNotificationsClient'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const [total, promo, linkedToAccounts] = await Promise.all([
    prisma.pushSubscription.count(),
    prisma.pushSubscription.count({ where: { promotions: true } }),
    prisma.pushSubscription.count({ where: { userId: { not: null } } }),
  ])
  return <AdminNotificationsClient configured={pushConfigured} stats={{ total, promo, linkedToAccounts }} />
}
