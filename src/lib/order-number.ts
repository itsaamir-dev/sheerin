import { randomInt } from 'crypto'

// Short, customer-friendly order numbers like "SHR-7K4M9P".
// The alphabet skips look-alike characters (0/O, 1/I/L) so numbers survive being read out on the phone.
const PREFIX = 'SHR-'
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const LENGTH = 6

export function generateOrderNumber() {
  let s = ''
  for (let i = 0; i < LENGTH; i++) s += ALPHABET[randomInt(ALPHABET.length)]
  return PREFIX + s
}

export { displayOrderNumber } from './order-number-format'
