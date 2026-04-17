import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://sheerin.com'

  const products = await prisma.product.findMany({
    where:   { available: true },
    select:  { slug: true, updatedAt: true },
  }).catch(() => [])

  const categories = await prisma.category.findMany({
    select: { slug: true },
  }).catch(() => [])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                        lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: `${base}/products`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/track-order`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/checkout`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map(c => ({
    url:             `${base}/products?category=${c.slug}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly' as const,
    priority:        0.8,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map(p => ({
    url:             `${base}/products/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority:        0.85,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
