import { prisma } from '@/lib/prisma'
import { AdminOrdersClient } from './AdminOrdersClient'

async function getOrders(status?: string) {
  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : {},
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return orders
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const orders = await getOrders(searchParams.status)
  return <AdminOrdersClient orders={orders} activeStatus={searchParams.status} />
}
