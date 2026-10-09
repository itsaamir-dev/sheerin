// Delivery date / time-slot rules. Pure functions — shared by the browser (to render
// choices) and the server (to validate orders), so both always agree.
// All clock maths happens in the bakery's timezone, not the server's (Vercel runs UTC).

export const DELIVERY_CONFIG = {
  timeZone: 'Asia/Kolkata',
  sameDayCutoffHour: 14,       // orders after 2 PM can't be delivered today
  minLeadHours: 3,             // baking + dispatch time needed before a slot starts
  maxAdvanceDays: 30,          // how far ahead customers can book
  freeDeliveryThreshold: 500,
  deliveryFee: 50,
  // Leave empty to deliver to every PIN code; otherwise list allowed prefixes, e.g. ['4110', '4112']
  serviceablePincodePrefixes: [] as string[],
}

export const DELIVERY_SLOTS = [
  { value: 'morning',   label: 'Morning',   time: '8 AM – 12 PM', startHour: 8,  endHour: 12 },
  { value: 'afternoon', label: 'Afternoon', time: '12 PM – 5 PM', startHour: 12, endHour: 17 },
  { value: 'evening',   label: 'Evening',   time: '5 PM – 9 PM',  startHour: 17, endHour: 21 },
] as const

export type SlotValue = (typeof DELIVERY_SLOTS)[number]['value']

export interface SlotAvailability {
  value: SlotValue
  label: string
  time: string
  available: boolean
  reason?: string
}

/** Current date (YYYY-MM-DD) and fractional hour in the bakery's timezone. */
export function bakeryNow(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DELIVERY_CONFIG.timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)!.value
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')) + Number(get('minute')) / 60,
  }
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

export function getSlotAvailability(date: string, now: Date = new Date()): SlotAvailability[] {
  const { date: today, hour } = bakeryNow(now)
  const offset = /^\d{4}-\d{2}-\d{2}$/.test(date) ? daysBetween(today, date) : NaN

  return DELIVERY_SLOTS.map((slot) => {
    const base = { value: slot.value, label: slot.label, time: slot.time }
    if (Number.isNaN(offset)) return { ...base, available: false, reason: 'Pick a date' }
    if (offset < 0) return { ...base, available: false, reason: 'Date has passed' }
    if (offset > DELIVERY_CONFIG.maxAdvanceDays)
      return { ...base, available: false, reason: `Book up to ${DELIVERY_CONFIG.maxAdvanceDays} days ahead` }
    if (offset === 0) {
      if (hour >= DELIVERY_CONFIG.sameDayCutoffHour)
        return { ...base, available: false, reason: 'Same-day cutoff passed' }
      if (slot.startHour - hour < DELIVERY_CONFIG.minLeadHours)
        return { ...base, available: false, reason: hour >= slot.startHour ? 'Slot expired' : 'Not enough time to bake' }
    }
    return { ...base, available: true }
  })
}

export function isSlotAvailable(date: string, slot: string, now: Date = new Date()) {
  return getSlotAvailability(date, now).some((s) => s.value === slot && s.available)
}

export function dayLabel(date: string, now: Date = new Date()) {
  const offset = daysBetween(bakeryNow(now).date, date)
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

/** Next `count` days with whether any slot is still bookable on each. */
export function getDeliveryDates(count = 7, now: Date = new Date()) {
  const { date: today } = bakeryNow(now)
  return Array.from({ length: count }, (_, i) => {
    const date = addDays(today, i)
    return { date, label: dayLabel(date, now), hasSlots: getSlotAvailability(date, now).some((s) => s.available) }
  })
}

/** Earliest bookable date + slot, used for "Earliest delivery: Today" messaging. */
export function getEarliestDelivery(now: Date = new Date()) {
  for (const d of getDeliveryDates(3, now)) {
    const slot = getSlotAvailability(d.date, now).find((s) => s.available)
    if (slot) return { date: d.date, label: d.label, slot }
  }
  return null
}

/** Hours:minutes left to order for same-day delivery, or null once it's no longer possible. */
export function sameDayTimeLeft(now: Date = new Date()) {
  const { date, hour } = bakeryNow(now)
  if (!getSlotAvailability(date, now).some((s) => s.available)) return null
  const lastSlotStart = Math.max(
    ...DELIVERY_SLOTS.map((s) => s.startHour).filter((h) => h - hour >= DELIVERY_CONFIG.minLeadHours),
  )
  const deadline = Math.min(DELIVERY_CONFIG.sameDayCutoffHour, lastSlotStart - DELIVERY_CONFIG.minLeadHours)
  const mins = Math.max(0, Math.floor((deadline - hour) * 60))
  return { hours: Math.floor(mins / 60), minutes: mins % 60 }
}

export function isPincodeServiceable(pincode: string) {
  if (!/^\d{6}$/.test(pincode)) return false
  const prefixes = DELIVERY_CONFIG.serviceablePincodePrefixes
  return prefixes.length === 0 || prefixes.some((p) => pincode.startsWith(p))
}

export function deliveryFeeFor(subtotal: number) {
  return subtotal >= DELIVERY_CONFIG.freeDeliveryThreshold ? 0 : DELIVERY_CONFIG.deliveryFee
}

/** Returns an error message, or null when the date/slot/pincode combination is bookable. */
export function validateDelivery(input: { deliveryDate: string; deliverySlot: string; pincode: string }, now: Date = new Date()) {
  if (!isPincodeServiceable(input.pincode)) return 'Sorry, we don’t deliver to this PIN code yet'
  if (!DELIVERY_SLOTS.some((s) => s.value === input.deliverySlot)) return 'Please choose a delivery time slot'
  if (!isSlotAvailable(input.deliveryDate, input.deliverySlot, now))
    return 'That delivery slot is no longer available — please pick another'
  return null
}

export function slotLabel(value: string) {
  const s = DELIVERY_SLOTS.find((x) => x.value === value)
  return s ? `${s.label} (${s.time})` : value
}

/** Items can still be added while the bakery has enough lead time before the booked slot. */
export const EDITABLE_ORDER_STATUSES = ['PENDING', 'CONFIRMED']

export function canAddItemsToOrder(order: { status: string; deliveryDate: string; deliverySlot: string }, now: Date = new Date()) {
  if (!EDITABLE_ORDER_STATUSES.includes(order.status)) return false
  const slot = DELIVERY_SLOTS.find((s) => s.value === order.deliverySlot)
  if (!slot) return false
  const { date: today, hour } = bakeryNow(now)
  const offset = daysBetween(today, order.deliveryDate)
  if (Number.isNaN(offset) || offset < 0) return false
  return offset > 0 || slot.startHour - hour >= DELIVERY_CONFIG.minLeadHours
}
