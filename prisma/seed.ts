import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPw = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@sheerin.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@sheerin.com',
      password: hashedPw,
      role: 'ADMIN',
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'birthday' }, update: {}, create: { name: 'Birthday Cakes', slug: 'birthday', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', description: 'Celebrate every birthday with our special cakes' } }),
    prisma.category.upsert({ where: { slug: 'wedding' }, update: {}, create: { name: 'Wedding Cakes', slug: 'wedding', image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400', description: 'Elegant cakes for your special day' } }),
    prisma.category.upsert({ where: { slug: 'custom' }, update: {}, create: { name: 'Custom Cakes', slug: 'custom', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', description: 'Designed exactly the way you want' } }),
    prisma.category.upsert({ where: { slug: 'photo' }, update: {}, create: { name: 'Photo Cakes', slug: 'photo', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400', description: 'Your memories on a cake' } }),
  ])

  // Occasion / flavour categories — products can belong to several categories at once
  const [anniversary, chocolate] = await Promise.all([
    prisma.category.upsert({ where: { slug: 'anniversary' }, update: {}, create: { name: 'Anniversary', slug: 'anniversary', group: 'OCCASION', sortOrder: 10, image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600', description: 'Celebrate love, year after year' } }),
    prisma.category.upsert({ where: { slug: 'chocolate' }, update: {}, create: { name: 'Chocolate Cakes', slug: 'chocolate', group: 'FLAVOUR', sortOrder: 5, image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400', description: 'For the chocoholics' } }),
  ])
  await prisma.category.update({ where: { slug: 'birthday' }, data: { group: 'OCCASION', sortOrder: 1 } })
  await prisma.category.update({ where: { slug: 'wedding' }, data: { group: 'OCCASION', sortOrder: 2 } })

  // Common options JSON
  const flavors = JSON.stringify([
    { label: 'Chocolate', priceAdd: 0 },
    { label: 'Vanilla', priceAdd: 0 },
    { label: 'Strawberry', priceAdd: 0 },
    { label: 'Red Velvet', priceAdd: 100 },
    { label: 'Butterscotch', priceAdd: 50 },
    { label: 'Mango', priceAdd: 50 },
  ])
  const eggOptions = JSON.stringify([
    { label: 'Egg', priceAdd: 0 },
    { label: 'Eggless', priceAdd: 50 },
  ])

  // Create products
  const products = [
    {
      name: 'Classic Chocolate Truffle',
      slug: 'classic-chocolate-truffle',
      description: 'Rich, velvety chocolate truffle cake with ganache frosting. A crowd favorite for all occasions.',
      basePrice: 499,
      images: JSON.stringify(['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600']),
      categoryId: categories[0].id,
      featured: true,
      highlights: JSON.stringify(['Layers of rich chocolate sponge and ganache', 'Finished with handmade chocolate truffles', '1 kg serves 8–10']),
      extraCategories: [chocolate.id, anniversary.id],
    },
    {
      name: 'Strawberry Dream Cake',
      slug: 'strawberry-dream',
      description: 'Light sponge layered with fresh strawberry cream and topped with fresh berries.',
      basePrice: 549,
      images: JSON.stringify(['https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600']),
      categoryId: categories[0].id,
      featured: true,
    },
    {
      name: 'Royal Wedding Cake',
      slug: 'royal-wedding-cake',
      description: 'Multi-tiered elegant white cake with floral decorations. Perfect for your dream wedding.',
      basePrice: 2999,
      images: JSON.stringify(['https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600']),
      categoryId: categories[1].id,
      featured: true,
    },
    {
      name: 'Black Forest Delight',
      slug: 'black-forest',
      description: 'Classic German-style black forest cake with cherries and whipped cream.',
      basePrice: 599,
      images: JSON.stringify(['https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600']),
      categoryId: categories[0].id,
      featured: false,
      extraCategories: [chocolate.id],
    },
    {
      name: 'Red Velvet Fantasy',
      slug: 'red-velvet-fantasy',
      description: 'Stunning red velvet cake with cream cheese frosting.',
      basePrice: 649,
      images: JSON.stringify(['https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600']),
      categoryId: categories[2].id,
      featured: true,
      highlights: JSON.stringify(['Classic red velvet sponge', 'Tangy cream cheese frosting', 'Available eggless']),
      extraCategories: [anniversary.id],
    },
    {
      name: 'Mango Delight',
      slug: 'mango-delight',
      description: 'Tropical mango cake with fresh mango pulp and cream.',
      basePrice: 499,
      images: JSON.stringify(['https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600']),
      categoryId: categories[0].id,
      featured: false,
    },
  ]

  for (const { extraCategories = [], ...product } of products as (typeof products[number] & { highlights?: string; extraCategories?: string[] })[]) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } })
    if (!existing) {
      const p = await prisma.product.create({
        data: { ...product, categories: { connect: [product.categoryId, ...extraCategories].map((id) => ({ id })) } },
      })
      // Add variants
      await prisma.productVariant.createMany({
        data: [
          { productId: p.id, name: 'Half kg', price: p.basePrice },
          { productId: p.id, name: '1 kg', price: p.basePrice * 1.8 },
          { productId: p.id, name: '1.5 kg', price: p.basePrice * 2.5 },
          { productId: p.id, name: '2 kg', price: p.basePrice * 3.2 },
        ],
      })
      // Add options
      await prisma.productOption.createMany({
        data: [
          { productId: p.id, name: 'Flavor', type: 'SELECT', required: true, values: flavors },
          { productId: p.id, name: 'Egg Type', type: 'SELECT', required: true, values: eggOptions },
          { productId: p.id, name: 'Message on Cake', type: 'TEXT', required: false, values: '[]' },
        ],
      })
      // Add reviews
      await prisma.review.createMany({
        data: [
          { productId: p.id, name: 'Priya S.', rating: 5, comment: 'Absolutely delicious! Delivered right on time.', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100' },
          { productId: p.id, name: 'Rahul M.', rating: 4, comment: 'Great cake, loved the freshness. Will order again!', image: null },
        ],
      })
    }
  }

  // Create coupons
  await prisma.coupon.upsert({ where: { code: 'WELCOME10' }, update: {}, create: { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrderValue: 200, active: true, isPublic: true } })
  await prisma.coupon.upsert({ where: { code: 'FLAT100' }, update: {}, create: { code: 'FLAT100', type: 'FIXED', value: 100, minOrderValue: 500, active: true } })
  await prisma.coupon.upsert({ where: { code: 'SWEET20' }, update: {}, create: { code: 'SWEET20', type: 'PERCENTAGE', value: 20, minOrderValue: 800, active: true, isPublic: true } })

  console.log('✅ Database seeded successfully!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
