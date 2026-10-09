import { prisma } from '@/lib/prisma'
import { bestSellerIds, cardInclude, categoryProductCounts, toCard } from '@/lib/catalog'
import { HeroSlider } from '@/components/home/HeroSlider'
import { CategorySection, OccasionSection } from '@/components/home/CategorySection'
import { DeliveryPromise } from '@/components/home/DeliveryPromise'
import { OffersSection } from '@/components/home/OffersSection'
import { ProductRail } from '@/components/product/ProductRail'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { HowItWorks } from '@/components/home/HowItWorks'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { CTABanner } from '@/components/home/CTABanner'

// Re-render at most once a minute so new products, banners and offers show up without a redeploy.
export const revalidate = 60

const RAIL_SIZE = 8

async function getHomeData() {
  const [banners, categories, counts, salesIds, newest, featured, coupons, reviews, reviewStats] = await Promise.all([
    prisma.banner.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
    prisma.category.findMany({ where: { showOnHome: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    categoryProductCounts(),
    bestSellerIds(RAIL_SIZE),
    prisma.product.findMany({ where: { available: true }, include: cardInclude, orderBy: { createdAt: 'desc' }, take: RAIL_SIZE }),
    prisma.product.findMany({ where: { available: true, featured: true }, include: cardInclude, take: 24 }),
    prisma.coupon.findMany({
      where: { active: true, isPublic: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: { value: 'desc' },
    }),
    prisma.review.findMany({
      where: { rating: { gte: 4 } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { product: { select: { name: true } } },
    }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
  ])

  // Best sellers: by units sold, topped up with featured products while sales data is thin.
  const sold = salesIds.length
    ? await prisma.product.findMany({ where: { id: { in: salesIds } }, include: cardInclude })
    : []
  const bestSellers = [
    ...salesIds.map((id) => sold.find((p) => p.id === id)!).filter(Boolean),
    ...featured.filter((p) => !salesIds.includes(p.id)),
  ].slice(0, RAIL_SIZE)

  const byRating = (p: (typeof featured)[number]) =>
    p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0
  const recommended = [...featured].sort((a, b) => byRating(b) - byRating(a)).slice(0, RAIL_SIZE)

  // Only advertise categories that have something to buy; empty ones appear automatically once stocked.
  const withCounts = categories
    .map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }))
    .filter((c) => c.productCount > 0)

  return {
    banners,
    shopCategories: withCounts.filter((c) => c.group !== 'OCCASION'),
    occasions: withCounts.filter((c) => c.group === 'OCCASION'),
    bestSellers: bestSellers.map(toCard),
    newArrivals: newest.map(toCard),
    recommended: recommended.map(toCard),
    offers: coupons
      .filter((c) => !c.maxUses || c.usedCount < c.maxUses)
      .map((c) => ({ id: c.id, code: c.code, type: c.type, value: c.value, minOrderValue: c.minOrderValue, expiresAt: c.expiresAt?.toISOString() ?? null })),
    reviews,
    reviewStats: { avg: reviewStats._avg.rating ?? 0, count: reviewStats._count },
  }
}

export default async function HomePage() {
  const d = await getHomeData()

  return (
    <div className="page-enter">
      <HeroSlider banners={d.banners} />
      <CategorySection categories={d.shopCategories} />
      <DeliveryPromise />
      <ProductRail eyebrow="Most loved" title="Best Sellers" products={d.bestSellers} viewAllHref="/products?sort=popular" tone="cream" />
      <OccasionSection categories={d.occasions} />
      <OffersSection offers={d.offers} />
      <ProductRail eyebrow="Just baked" title="New Arrivals" products={d.newArrivals} viewAllHref="/products?sort=newest" badge="New" />
      <ProductRail eyebrow="Handpicked" title="Recommended for You" products={d.recommended} viewAllHref="/products" tone="cream" />
      <WhyChooseUs />
      <ReviewsSection reviews={d.reviews} stats={d.reviewStats} />
      <HowItWorks />
      <CTABanner />
    </div>
  )
}
