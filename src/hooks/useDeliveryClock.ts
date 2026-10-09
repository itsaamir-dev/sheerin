'use client'
import { useEffect, useState } from 'react'

/**
 * Current time, refreshed every minute. Null during SSR/first render so delivery messaging
 * (which depends on the visitor's clock) never causes hydration mismatches.
 */
export function useDeliveryClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])
  return now
}
