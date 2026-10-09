import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/order-number'
import type { Prisma } from '@prisma/client'

/**
 * Finds an order from whatever the customer typed: "SHR-7K4M9P", "#shr7k4m9p", "7K4M9P",
 * an internal id, or (for orders placed before readable numbers) the full cuid or its 8-char display suffix.
 */
export async function findOrderByCustomerInput<T extends Prisma.OrderInclude>(raw: string, include: T) {
  const s = raw.trim().replace(/^#/, '').replace(/\s+/g, '')
  if (!s) return null
  const upper = s.toUpperCase()
  const readable = /^(SHR-?)?[A-Z0-9]{6}$/.test(upper) ? 'SHR-' + upper.slice(-6) : null

  const exact = await prisma.order.findFirst({
    where: { OR: [{ id: s }, { orderNumber: s }, ...(readable ? [{ orderNumber: readable }] : [])] },
    include,
  })
  if (exact || s.length < 8) return exact

  const legacy = await prisma.order.findMany({
    where: { orderNumber: { endsWith: s.toLowerCase() }, NOT: { orderNumber: { startsWith: 'SHR-' } } },
    include,
    take: 2,
  })
  return legacy.length === 1 ? legacy[0] : null
}

/** Creates an order with a fresh readable number, retrying on the (rare) collision. */
export async function createOrderWithNumber<T extends Prisma.OrderInclude>(
  data: Omit<Prisma.OrderUncheckedCreateInput, 'orderNumber'>,
  include: T,
) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.order.create({ data: { ...data, orderNumber: generateOrderNumber() }, include })
    } catch (e: any) {
      const collided = e?.code === 'P2002' && String(e?.meta?.target).includes('orderNumber')
      if (!collided || attempt >= 4) throw e
    }
  }
}

export function maskPhone(phone: string) {
  return phone.length > 4 ? '•'.repeat(phone.length - 4) + phone.slice(-4) : phone
}

export function phonesMatch(a: string, b: string) {
  const digits = (x: string) => x.replace(/\D/g, '').slice(-10)
  return digits(a).length === 10 && digits(a) === digits(b)
}
