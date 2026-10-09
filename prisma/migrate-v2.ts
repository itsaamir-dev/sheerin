// One-off, idempotent data migration for the catalogue/ordering update.
// Run AFTER `prisma db push`:  npx tsx prisma/migrate-v2.ts
//
// 1. Multi-category: every product is also listed in its existing (primary) category.
// 2. Egg type: products without an egg/eggless option are marked NONE (not applicable),
//    so the egg filter and badges are hidden for them. Products with the option stay BOTH.
// Existing order numbers are deliberately left untouched so links customers already have keep working.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, categoryId: true, eggType: true, options: { select: { name: true } }, categories: { select: { id: true } } },
  })

  let linked = 0
  let markedNone = 0
  for (const p of products) {
    if (!p.categories.some((c) => c.id === p.categoryId)) {
      await prisma.product.update({ where: { id: p.id }, data: { categories: { connect: { id: p.categoryId } } } })
      linked++
    }
    const hasEggOption = p.options.some((o) => /egg/i.test(o.name))
    if (!hasEggOption && p.eggType === 'BOTH') {
      await prisma.product.update({ where: { id: p.id }, data: { eggType: 'NONE' } })
      markedNone++
    }
  }

  console.log(`✅ ${products.length} products checked: ${linked} linked to their primary category, ${markedNone} marked as not egg-based.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
