// Product helpers shared by server components, client components and API routes.

export const EXTRAS = [
  { name: 'Candles (set of 6)', price: 50, emoji: '🕯️' },
  { name: 'Knife', price: 30, emoji: '🔪' },
  { name: 'Greeting Card', price: 40, emoji: '💌' },
  { name: 'Gift Box', price: 80, emoji: '🎁' },
]

// EGG/EGGLESS: only that variant is baked, so the egg choice is hidden and fixed.
// BOTH: customer chooses. NONE: not a baked item (flowers, chocolates…) — no egg info at all.
export const EGG_TYPES = ['BOTH', 'EGGLESS', 'EGG', 'NONE'] as const
export type EggType = (typeof EGG_TYPES)[number]

export const EGG_TYPE_LABELS: Record<EggType, string> = {
  BOTH: 'Egg & Eggless available',
  EGGLESS: '100% Eggless',
  EGG: 'Contains egg',
  NONE: 'Not applicable',
}

export const isEggOption = (name: string) => /egg/i.test(name)

/** The value an egg option is locked to, or null when the customer picks (or it doesn't apply). */
export function fixedEggChoice(eggType: string): string | null {
  if (eggType === 'EGG') return 'Egg'
  if (eggType === 'EGGLESS') return 'Eggless'
  return null
}

/** Whether a product matches the listing's egg filter ("eggless" | "egg"). */
export function matchesEggFilter(eggType: string, filter?: string) {
  if (filter === 'eggless') return eggType === 'EGGLESS' || eggType === 'BOTH'
  if (filter === 'egg') return eggType === 'EGG' || eggType === 'BOTH'
  return true
}

export function parseJsonArray<T = string>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  try {
    const parsed = JSON.parse(String(value ?? '[]'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587'

/** Requests a correctly sized, compressed rendition from Unsplash; local uploads pass through unchanged. */
export function productImage(url: string | undefined | null, width: number) {
  const src = url || FALLBACK_IMAGE
  if (!src.includes('images.unsplash.com')) return src
  const u = new URL(src)
  u.searchParams.set('w', String(width))
  u.searchParams.set('h', String(width))
  u.searchParams.set('fit', 'crop')
  u.searchParams.set('q', '80')
  u.searchParams.set('auto', 'format')
  return u.toString()
}

export function minPrice(p: { basePrice: number; variants?: { price: number; available?: boolean }[] }) {
  const prices = (p.variants || []).filter((v) => v.available !== false).map((v) => v.price)
  return prices.length ? Math.min(...prices) : p.basePrice
}

export function avgRating(reviews: { rating: number }[]) {
  return reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}
