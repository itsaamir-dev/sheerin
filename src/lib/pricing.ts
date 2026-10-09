import { prisma } from '@/lib/prisma'
import { EXTRAS, fixedEggChoice, isEggOption, parseJsonArray } from '@/lib/product-utils'

// Server-side cart pricing. The browser's prices are only a preview: every order (and every
// item added to an existing order) is re-priced here from the database.

export interface CartLineInput {
  productId: string
  variantId?: string
  variantName?: string
  options?: Record<string, string>
  extras?: { name: string }[] | string[]
  quantity: number
}

export interface PricedLine {
  productId: string
  productName: string
  variantName: string | null
  options: Record<string, string>
  extras: { name: string; price: number }[]
  quantity: number
  price: number   // per unit, including option surcharges and extras
  total: number
}

export class PricingError extends Error {}

const MAX_QTY = 20
const MAX_TEXT = 50

export async function priceCart(lines: CartLineInput[]): Promise<{ lines: PricedLine[]; subtotal: number }> {
  if (!Array.isArray(lines) || lines.length === 0) throw new PricingError('Your cart is empty')

  const products = await prisma.product.findMany({
    where: { id: { in: Array.from(new Set(lines.map((l) => l.productId))) } },
    include: { variants: true, options: true },
  })

  const priced = lines.map((line): PricedLine => {
    const product = products.find((p) => p.id === line.productId)
    if (!product || !product.available) throw new PricingError('An item in your cart is no longer available')

    const qty = Math.floor(Number(line.quantity))
    if (!(qty >= 1 && qty <= MAX_QTY)) throw new PricingError(`Quantity must be between 1 and ${MAX_QTY}`)

    // Match by id first; fall back to name so carts saved before a variant was edited still work.
    const variant =
      product.variants.find((v) => v.id === line.variantId) ||
      product.variants.find((v) => v.name === line.variantName)
    if (product.variants.length && (!variant || !variant.available))
      throw new PricingError(`Selected size of ${product.name} is unavailable`)

    const options: Record<string, string> = {}
    let optionAdd = 0
    for (const opt of product.options) {
      if (isEggOption(opt.name)) {
        if (product.eggType === 'NONE') continue
        const fixed = fixedEggChoice(product.eggType)
        if (fixed) { options[opt.name] = fixed; continue } // single-variant bakes: price already in base
      }
      const chosen = line.options?.[opt.name]?.toString().trim()
      if (!chosen) {
        if (opt.required) throw new PricingError(`Please select ${opt.name} for ${product.name}`)
        continue
      }
      if (opt.type === 'TEXT') {
        options[opt.name] = chosen.slice(0, MAX_TEXT)
        continue
      }
      const value = parseJsonArray<{ label: string; priceAdd: number }>(opt.values).find((v) => v.label === chosen)
      if (!value) throw new PricingError(`Invalid ${opt.name} for ${product.name}`)
      options[opt.name] = value.label
      optionAdd += Number(value.priceAdd) || 0
    }

    const extraNames = (line.extras || []).map((e) => (typeof e === 'string' ? e : e.name))
    const extras = EXTRAS.filter((e) => extraNames.includes(e.name)).map(({ name, price }) => ({ name, price }))
    const extrasTotal = extras.reduce((s, e) => s + e.price, 0)

    const price = (variant?.price ?? product.basePrice) + optionAdd + extrasTotal
    return {
      productId: product.id,
      productName: product.name,
      variantName: variant?.name ?? null,
      options,
      extras,
      quantity: qty,
      price,
      total: price * qty,
    }
  })

  return { lines: priced, subtotal: priced.reduce((s, l) => s + l.total, 0) }
}

export const toOrderItemData = (l: PricedLine, addedLater = false) => ({
  productId: l.productId,
  productName: l.productName,
  variantName: l.variantName,
  options: JSON.stringify(l.options),
  extras: l.extras.length ? JSON.stringify(l.extras) : null,
  quantity: l.quantity,
  price: l.price,
  total: l.total,
  addedLater,
})
