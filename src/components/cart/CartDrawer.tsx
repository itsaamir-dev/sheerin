'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const { items, removeItem, updateQuantity, subtotal } = useCartStore()

  useEffect(() => {
    const handler = () => setOpen((p) => !p)
    window.addEventListener('toggle-cart', handler)
    return () => window.removeEventListener('toggle-cart', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-rose-600" />
            <h2 className="font-display font-bold text-lg">Your Cart</h2>
            {items.length > 0 && (
              <span className="badge bg-rose-100 text-rose-700">{items.length} items</span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-rose-300" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-gray-700">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add some delicious cakes!</p>
              </div>
              <Link href="/products" onClick={() => setOpen(false)} className="btn-primary text-sm">
                Browse Cakes
              </Link>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-rose-50/50 rounded-xl">
                <div className="w-16 h-16 bg-rose-100 rounded-lg overflow-hidden shrink-0">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎂</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{item.product?.name}</p>
                  <p className="text-xs text-gray-500">{item.variant?.name}</p>
                  {Object.entries(item.selectedOptions || {}).map(([k, v]) => (
                    <p key={k} className="text-xs text-gray-400">{k}: {v}</p>
                  ))}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-rose-600">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="w-6 h-6 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-rose-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="w-6 h-6 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-rose-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-900">₹{subtotal().toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="btn-primary w-full text-center flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <span className="font-bold">₹{subtotal().toFixed(0)}</span>
            </Link>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="btn-secondary w-full text-center text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
