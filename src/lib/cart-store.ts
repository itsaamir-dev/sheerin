'use client'
import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartExtra, Product, ProductVariant } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'price'> & { price: number }) => void
  removeItem: (productId: string, variantId: string) => void
  updateQuantity: (productId: string, variantId: string, quantity: number) => void
  clearCart: () => void
  applyServerPrices: (lines: { productId: string; variantName: string | null; price: number; extras: { price: number }[] }[]) => void
  subtotal: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId &&
              JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }))
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      // Server responses list lines in cart order; `price` there includes extras, the cart keeps them separate.
      applyServerPrices: (lines) => {
        set((state) => ({
          items: state.items.map((item, i) => {
            const line = lines[i]
            if (!line || line.productId !== item.productId) return item
            const extrasTotal = line.extras.reduce((s, e) => s + e.price, 0)
            return { ...item, price: line.price - extrasTotal }
          }),
        }))
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => {
          const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0)
          return sum + (item.price + extrasTotal) * item.quantity
        }, 0)
      },

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    // Rehydrated after mount by <StoreHydrator/>, so the first client render matches the server (empty cart).
    { name: 'sheerin-cart', skipHydration: true }
  )
)

/** When set, checkout adds the cart to this existing order instead of creating a new one. */
interface AddToOrderStore {
  target: { orderNumber: string; displayNumber: string; phone?: string } | null
  start: (target: { orderNumber: string; displayNumber: string; phone?: string }) => void
  cancel: () => void
}

export const useAddToOrderStore = create<AddToOrderStore>()(
  persist(
    (set) => ({
      target: null,
      start: (target) => set({ target }),
      cancel: () => set({ target: null }),
    }),
    { name: 'sheerin-add-to-order', skipHydration: true }
  )
)

/** Loads persisted cart state from localStorage once the app has mounted. */
export function StoreHydrator() {
  useEffect(() => {
    useCartStore.persist.rehydrate()
    useAddToOrderStore.persist.rehydrate()
  }, [])
  return null
}

/** True once the persisted cart has been loaded (use before deciding the cart is empty). */
export function useCartHydrated() {
  // Always start false: pages hydrate inside a Suspense boundary *after* the layout, by which time
  // the store may already be loaded — reading it here would make the first render differ from the server's.
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) setDone(true)
    return useCartStore.persist.onFinishHydration(() => setDone(true))
  }, [])
  return done
}
