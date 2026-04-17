import { prisma } from '@/lib/prisma'
import { HeroSection } from '@/components/home/HeroSection'
import { CategorySection } from '@/components/home/CategorySection'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { HowItWorks } from '@/components/home/HowItWorks'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { CTABanner } from '@/components/home/CTABanner'

async function getHomeData() {
  const [categories, featured, reviews] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
    prisma.product.findMany({
      where: { featured: true, available: true },
      include: { variants: true, category: true, reviews: { take: 3 } },
      take: 6,
    }),
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { product: { select: { name: true } } },
    }),
  ])
  return { categories, featured, reviews }
}

export default async function HomePage() {
  const { categories, featured, reviews } = await getHomeData()

  // Parse JSON fields
  const parsedFeatured = featured.map((p) => ({
    ...p,
    images: JSON.parse(p.images as string),
    variants: p.variants,
  }))

  return (
    <div className="page-enter">
      <HeroSection />
      <CategorySection categories={categories} />
      <FeaturedProducts products={parsedFeatured} />
      <WhyChooseUs />
      <HowItWorks />
      <ReviewsSection reviews={reviews} />
      <CTABanner />
    </div>
  )
}
