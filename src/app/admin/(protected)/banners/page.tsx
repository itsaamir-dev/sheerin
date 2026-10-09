import { prisma } from '@/lib/prisma'
import { AdminBannersClient } from './AdminBannersClient'

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
  return <AdminBannersClient banners={banners} />
}
