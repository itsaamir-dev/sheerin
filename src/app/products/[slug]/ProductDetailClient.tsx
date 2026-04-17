'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Star, Heart, Share2, Plus, Minus, Check, Clock, Truck, MessageSquare } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import toast from 'react-hot-toast'

const EXTRAS = [
  { name: 'Candles (set of 6)', price: 50, emoji: '🕯️' },
  { name: 'Knife', price: 30, emoji: '🔪' },
  { name: 'Greeting Card', price: 40, emoji: '💌' },
  { name: 'Gift Box', price: 80, emoji: '🎁' },
]

export function ProductDetailClient({ product, related }: { product: any; related: any[] }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [extras, setExtras] = useState<Record<string, boolean>>({})
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc')
  const addItem = useCartStore((s) => s.addItem)

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 5

  const extrasList = Object.entries(extras)
    .filter(([, v]) => v)
    .map(([k]) => EXTRAS.find((e) => e.name === k)!)
    .filter(Boolean)

  const optionPriceAdd = Object.entries(selectedOptions).reduce((sum, [key, val]) => {
    const opt = product.options.find((o: any) => o.name === key)
    const found = opt?.values?.find((v: any) => v.label === val)
    return sum + (found?.priceAdd || 0)
  }, 0)

  const extrasTotal = extrasList.reduce((s, e) => s + e.price, 0)
  const unitPrice = (selectedVariant?.price || product.basePrice) + optionPriceAdd
  const totalPrice = (unitPrice + extrasTotal) * quantity

  const checkDeliveryToday = () => {
    const now = new Date()
    return now.getHours() < 14 // Before 2 PM
  }

  const handleAddToCart = () => {
    const missing = product.options.filter((o: any) => o.required && !selectedOptions[o.name])
    if (missing.length) {
      toast.error(`Please select: ${missing.map((o: any) => o.name).join(', ')}`)
      return
    }

    addItem({
      productId: product.id,
      product,
      variantId: selectedVariant?.id || '',
      variant: selectedVariant,
      selectedOptions,
      quantity,
      price: unitPrice,
      extras: extrasList.map((e) => ({ name: e.name, price: e.price })),
    })

    toast.success('Added to cart! 🎂')
    const event = new CustomEvent('toggle-cart')
    window.dispatchEvent(event)
  }

  const handleWhatsApp = () => {
    const msg = `Hi! I'd like to order:\n*${product.name}* - ${selectedVariant?.name}\n${Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join('\n')}\nQty: ${quantity}\nTotal: ₹${totalPrice}\n\nPlease confirm availability!`
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-rose-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-rose-600">Cakes</Link>
          <span>/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-rose-50">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {checkDeliveryToday() && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Today delivery available
                </div>
              )}
              <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-all">
                <Heart className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-rose-500 shadow-md' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details + Customization */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <p className="text-rose-500 text-sm font-semibold mb-1">{product.category?.name}</p>
              <h1 className="font-display text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({product.reviews.length} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-rose-50 rounded-2xl p-4">
              <p className="text-sm text-gray-500 mb-1">Total Price</p>
              <p className="font-display text-4xl font-bold text-rose-600">₹{totalPrice.toFixed(0)}</p>
              <p className="text-xs text-gray-400 mt-1">₹{unitPrice}/unit × {quantity} + ₹{extrasTotal} extras</p>
            </div>

            {/* Variant / Size Selection */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Cake Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 text-gray-600 hover:border-rose-300'
                    }`}
                  >
                    {v.name}
                    <span className={`ml-2 text-xs ${selectedVariant?.id === v.id ? 'text-rose-500' : 'text-gray-400'}`}>
                      ₹{v.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            {product.options.map((opt: any) => (
              <div key={opt.id}>
                <h3 className="font-semibold text-gray-800 mb-3">
                  {opt.name}
                  {opt.required && <span className="text-rose-500 ml-1 text-xs">*required</span>}
                </h3>

                {opt.type === 'SELECT' && (
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val: any) => (
                      <button
                        key={val.label}
                        onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.name]: val.label }))}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedOptions[opt.name] === val.label
                            ? 'border-rose-500 bg-rose-50 text-rose-700'
                            : 'border-gray-200 text-gray-600 hover:border-rose-300'
                        }`}
                      >
                        {val.label}
                        {val.priceAdd > 0 && <span className="text-xs ml-1 text-gray-400">+₹{val.priceAdd}</span>}
                      </button>
                    ))}
                  </div>
                )}

                {opt.type === 'TEXT' && (
                  <input
                    type="text"
                    placeholder={`E.g., "Happy Birthday Priya! 🎂"`}
                    maxLength={50}
                    value={selectedOptions[opt.name] || ''}
                    onChange={(e) => setSelectedOptions((prev) => ({ ...prev, [opt.name]: e.target.value }))}
                    className="input-field"
                  />
                )}
              </div>
            ))}

            {/* Extras */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Add Extras</h3>
              <div className="grid grid-cols-2 gap-2">
                {EXTRAS.map((extra) => (
                  <label
                    key={extra.name}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      extras[extra.name] ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={!!extras[extra.name]}
                      onChange={(e) => setExtras((prev) => ({ ...prev, [extra.name]: e.target.checked }))}
                    />
                    <span className="text-lg">{extra.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{extra.name}</p>
                      <p className="text-xs text-rose-500 font-medium">+₹{extra.price}</p>
                    </div>
                    {extras[extra.name] && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-gray-800">Quantity</h3>
              <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delivery info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
              <Truck className="w-4 h-4 text-green-600 shrink-0" />
              <span>Free delivery on orders above ₹500</span>
              <span>•</span>
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{checkDeliveryToday() ? '⚡ Same-day delivery available!' : 'Next-day delivery available'}</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2 py-4 text-base">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-4 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex gap-6 border-b border-gray-100">
                {(['desc', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 ${
                      activeTab === tab ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'desc' ? 'Description' : `Reviews (${product.reviews.length})`}
                  </button>
                ))}
              </div>

              {activeTab === 'desc' && (
                <p className="mt-4 text-gray-600 leading-relaxed text-sm">{product.description}</p>
              )}

              {activeTab === 'reviews' && (
                <div className="mt-4 space-y-4">
                  {product.reviews.length === 0 ? (
                    <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
                  ) : (
                    product.reviews.map((r: any) => (
                      <div key={r.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-9 h-9 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-600 shrink-0">
                          {r.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-800">{r.name}</p>
                            <div className="flex">
                              {[...Array(r.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{r.comment}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((r: any) => (
                <Link key={r.id} href={`/products/${r.slug}`} className="card group hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="aspect-square overflow-hidden bg-rose-50">
                    <img src={r.images[0]} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3">
                    <h4 className="font-display font-semibold text-sm text-gray-900 truncate">{r.name}</h4>
                    <p className="text-rose-600 font-bold text-sm mt-1">₹{Math.min(...r.variants.map((v: any) => v.price))}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
