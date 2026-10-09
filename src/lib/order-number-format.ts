// Client-safe helper (no node:crypto) for showing order numbers.

/** Orders placed before readable numbers existed carry a cuid; show its last 8 chars, as the admin always has. */
export function displayOrderNumber(orderNumber: string) {
  return orderNumber.startsWith('SHR-') ? orderNumber : orderNumber.slice(-8).toUpperCase()
}
