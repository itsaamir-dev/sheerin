import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { AdminOrderDetailClient } from './AdminOrderDetailClient'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: params.id }, { orderNumber: params.id }] },
    include: { items: true },
  })
  if (!order) notFound()
  return <AdminOrderDetailClient order={order} />
}
