'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Star, Plus, Minus, Check, Clock, Truck, ChevronDown, Sparkles } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { EXTRAS, EGG_TYPE_LABELS, isEggOption, fixedEggChoice, type EggType } from '@/lib/product-utils'
import { DELIVERY_CONFIG, getEarliestDelivery, sameDayTimeLeft } from '@/lib/delivery'
import { useDeliveryClock } from '@/hooks/useDeliveryClock'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductRail } from '@/components/product/ProductRail'
import { EggMark, EggPill } from '@/components/product/EggBadge'
import type { ProductCardData } from '@/lib/catalog'
import toast from 'react-hot-toast'

const MESSAGE_MAX = 50

const DEFAULT_CARE = {
  baked: [
    'Refrigerate within 1 hour of delivery and keep chilled until serving.',
    'Take the cake out 15–20 minutes before serving for the best texture.',
    'Best enjoyed within 24 hours of delivery.',
    'Fondant and decorative toppers may contain inedible supports — remove before eating.',
  ],
  other: ['Store in a cool, dry place away from direct sunlight.', 'Handle gently on arrival.'],
}

export function ProductDetailClient({ product, related, preferEggless }: { product: any; related: ProductCardData[]; preferEggless?: boolean }) {
  const eggType: EggType = product.eggType
  const eggOption = product.options.find((o: any) => isEggOption(o.name))
  // Egg choice is shown only when the customer really has one; otherwise it's fixed (or not applicable).
  const showEggChoice = eggType === 'BOTH' && !!eggOption
  const visibleOptions = product.options.filter((o: any) => !isEggOption(o.name))

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    if (eggOption) {
      const fixed = fixedEggChoice(eggType)
      if (fixed) init[eggOption.name] = fixed
      else if (showEggChoice && preferEggless) init[eggOption.name] = 'Eggless'
    }
    return init
  })
  const [extras, setExtras] = useState<Record<string, boolean>>({})
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((s) => s.addItem)
  const now = useDeliveryClock()
  const earliest = now ? getEarliestDelivery(now) : null
  const timeLeft = now ? sameDayTimeLeft(now) : null

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0

  const extrasList = EXTRAS.filter((e) => extras[e.name])

  // Mirrors src/lib/pricing.ts: a fixed egg type is already in the base price, so it adds nothing.
  const optionPriceAdd = Object.entries(selectedOptions).reduce((sum, [key, val]) => {
    if (isEggOption(key) && !showEggChoice) return sum
    const found = product.options.find((o: any) => o.name === key)?.values?.find((v: any) => v.label === val)
    return sum + (found?.priceAdd || 0)
  }, 0)

  const extrasTotal = extrasList.reduce((s, e) => s + e.price, 0)
  const unitPrice = (selectedVariant?.price ?? product.basePrice) + optionPriceAdd
  const totalPrice = (unitPrice + extrasTotal) * quantity

  const handleAddToCart = () => {
    const missing = product.options.filter((o: any) => o.required && !selectedOptions[o.name] && !(isEggOption(o.name) && eggType === 'NONE'))
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
    window.dispatchEvent(new CustomEvent('toggle-cart'))
  }

  const handleWhatsApp = () => {
    const msg = `Hi! I'd like to order:\n*${product.name}* - ${selectedVariant?.name ?? ''}\n${Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join('\n')}\nQty: ${quantity}\nTotal: ₹${totalPrice}\n\nPlease confirm availability!`
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // ── Structured description ────────────────────────────────────────────────
  const flavourOpt = visibleOptions.find((o: any) => /flavou?r/i.test(o.name) && o.type === 'SELECT')
  const messageOpt = visibleOptions.find((o: any) => o.type === 'TEXT')
  const allCategories = [product.category, ...product.categories.filter((c: any) => c.id !== product.category?.id)].filter(Boolean)
  const details: [string, React.ReactNode][] = [
    ['Category', allCategories.map((c: any, i: number) => (
      <span key={c.id}>{i > 0 && ', '}<Link href={`/products?category=${c.slug}`} className="text-rose-600 hover:underline">{c.name}</Link></span>
    ))],
    ...(product.variants.length ? [['Available sizes', product.variants.map((v: any) => v.name).join(' · ')] as [string, string]] : []),
    ...(flavourOpt ? [['Flavours', flavourOpt.values.map((v: any) => v.label).join(', ')] as [string, string]] : []),
    ...(eggType !== 'NONE' ? [['Egg / Eggless', EGG_TYPE_LABELS[eggType]] as [string, string]] : []),
    ...(messageOpt ? [['Personalisation', `Message on the cake (up to ${MESSAGE_MAX} characters)`] as [string, string]] : []),
    ['Add-ons', EXTRAS.map((e) => e.name).join(', ')],
  ]
  const care: string[] = product.careInstructions
    ? String(product.careInstructions).split('\n').map((s: string) => s.trim()).filter(Boolean)
    : eggType === 'NONE' ? DEFAULT_CARE.other : DEFAULT_CARE.baked

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-rose-600">Home</Link>
          <span>/</span>
          {product.category ? (
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-rose-600">{product.category.name}</Link>
          ) : (
            <Link href="/products" className="hover:text-rose-600">Cakes</Link>
          )}
          <span>/</span>
          <span className="text-gray-700 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <ProductGallery
            images={product.images}
            name={product.name}
            overlay={earliest?.label === 'Today' ? (
              <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Same-day delivery
              </div>
            ) : null}
          />

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <EggPill eggType={eggType} />
                {product.featured && <span className="badge bg-amber-100 text-amber-800 text-[11px]">⭐ Bestseller</span>}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.reviews.length > 0 && (
                <a href="#reviews" className="inline-flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    {avgRating.toFixed(1)} <Star className="w-3 h-3 fill-white" />
                  </span>
                  <span className="text-sm text-gray-500 hover:text-rose-600">{product.reviews.length} review{product.reviews.length === 1 ? '' : 's'}</span>
                </a>
              )}
              {product.description && <p className="text-gray-600 text-sm leading-relaxed mt-3">{product.description}</p>}
            </div>

            <div className="bg-white border border-rose-100 rounded-2xl p-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-3xl md:text-4xl font-bold text-gray-900">₹{totalPrice.toFixed(0)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  ₹{unitPrice.toFixed(0)} × {quantity}{extrasTotal > 0 && ` + ₹${extrasTotal * quantity} add-ons`} · inclusive of all taxes
                </p>
              </div>
            </div>

            {product.variants.length > 0 && (
              <OptionBlock title="Select Size">
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <ChoiceButton key={v.id} selected={selectedVariant?.id === v.id} onClick={() => setSelectedVariant(v)}>
                      {v.name}<span className="ml-2 text-xs opacity-70">₹{v.price.toFixed(0)}</span>
                    </ChoiceButton>
                  ))}
                </div>
              </OptionBlock>
            )}

            {showEggChoice && (
              <OptionBlock title="Egg or Eggless" required>
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  {eggOption.values.map((val: any) => {
                    const selected = selectedOptions[eggOption.name] === val.label
                    const isEggless = /less/i.test(val.label)
                    return (
                      <button
                        key={val.label}
                        type="button"
                        onClick={() => setSelectedOptions((p) => ({ ...p, [eggOption.name]: val.label }))}
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                          selected ? (isEggless ? 'border-green-600 bg-green-50 text-green-800' : 'border-amber-700 bg-amber-50 text-amber-900') : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <EggMark eggType={isEggless ? 'EGGLESS' : 'EGG'} decorative />
                        <span className="flex-1">{val.label}</span>
                        {val.priceAdd > 0 && <span className="text-xs font-normal opacity-70">+₹{val.priceAdd}</span>}
                      </button>
                    )
                  })}
                </div>
              </OptionBlock>
            )}

            {visibleOptions.map((opt: any) => (
              <OptionBlock key={opt.id} title={opt.name} required={opt.required}>
                {opt.type === 'SELECT' && (
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val: any) => (
                      <ChoiceButton
                        key={val.label}
                        selected={selectedOptions[opt.name] === val.label}
                        onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.name]: val.label }))}
                      >
                        {val.label}
                        {val.priceAdd > 0 && <span className="text-xs ml-1 opacity-70">+₹{val.priceAdd}</span>}
                      </ChoiceButton>
                    ))}
                  </div>
                )}
                {opt.type === 'TEXT' && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder='E.g., "Happy Birthday Priya!"'
                      maxLength={MESSAGE_MAX}
                      value={selectedOptions[opt.name] || ''}
                      onChange={(e) => setSelectedOptions((prev) => ({ ...prev, [opt.name]: e.target.value }))}
                      className="input-field pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {(selectedOptions[opt.name] || '').length}/{MESSAGE_MAX}
                    </span>
                  </div>
                )}
              </OptionBlock>
            ))}

            <OptionBlock title="Make it special">
              <div className="grid grid-cols-2 gap-2">
                {EXTRAS.map((extra) => (
                  <label
                    key={extra.name}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      extras[extra.name] ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-200 bg-white'
                    }`}
                  >
                    <input type="checkbox" className="sr-only" checked={!!extras[extra.name]}
                      onChange={(e) => setExtras((prev) => ({ ...prev, [extra.name]: e.target.checked }))} />
                    <span className="text-lg">{extra.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{extra.name}</p>
                      <p className="text-xs text-rose-500 font-medium">+₹{extra.price}</p>
                    </div>
                    {extras[extra.name] && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                  </label>
                ))}
              </div>
            </OptionBlock>

            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-gray-800">Quantity</h3>
              <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(20, quantity + 1))} aria-label="Increase quantity" className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delivery availability, from the same rules checkout enforces */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-green-600 shrink-0" />
                {!now ? 'Checking delivery times…' : earliest ? (
                  <span>
                    Earliest delivery: <strong className={earliest.label === 'Today' ? 'text-green-700' : ''}>{earliest.label}</strong>, {earliest.slot.label.toLowerCase()} ({earliest.slot.time})
                    {timeLeft && <span className="text-gray-500"> — order within {timeLeft.hours ? `${timeLeft.hours}h ` : ''}{timeLeft.minutes}m</span>}
                  </span>
                ) : 'Delivery slots are fully booked for the next few days'}
              </p>
              <p className="flex items-center gap-2 text-gray-500">
                <Truck className="w-4 h-4 text-rose-500 shrink-0" />
                Free delivery on orders above ₹{DELIVERY_CONFIG.freeDeliveryThreshold}
              </p>
            </div>

            <div className="flex gap-3 sticky bottom-16 lg:static z-10 bg-[#FDF8F3] lg:bg-transparent py-2 lg:py-0 -mx-4 px-4 lg:mx-0 lg:px-0">
              <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2 py-4 text-base">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button onClick={handleWhatsApp} aria-label="Order on WhatsApp"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-4 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>

            {/* Same structure for every product, so shoppers always know where to look */}
            <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100">
              {product.highlights.length > 0 && (
                <Section title="Highlights" defaultOpen>
                  <ul className="space-y-2">
                    {product.highlights.map((h: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                        <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />{h}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              <Section title="Product Details" defaultOpen={product.highlights.length === 0}>
                <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2.5 text-sm">
                  {details.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-gray-400">{k}</dt>
                      <dd className="text-gray-700">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-xs text-gray-400 mt-3">Design and decorations may vary slightly from the photo, as each item is handcrafted.</p>
              </Section>
              <Section title="Delivery Information">
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                  <li>Same-day delivery on orders placed before {DELIVERY_CONFIG.sameDayCutoffHour > 12 ? DELIVERY_CONFIG.sameDayCutoffHour - 12 : DELIVERY_CONFIG.sameDayCutoffHour} PM, subject to slot availability.</li>
                  <li>We need at least {DELIVERY_CONFIG.minLeadHours} hours to bake and dispatch, so slots starting sooner aren’t offered.</li>
                  <li>Choose a morning, afternoon or evening slot at checkout; book up to {DELIVERY_CONFIG.maxAdvanceDays} days ahead.</li>
                  <li>Free delivery above ₹{DELIVERY_CONFIG.freeDeliveryThreshold}; otherwise ₹{DELIVERY_CONFIG.deliveryFee}.</li>
                </ul>
              </Section>
              <Section title="Care Instructions">
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                  {care.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </Section>
              <Section title={`Reviews (${product.reviews.length})`} id="reviews">
                {product.reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm">No reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {product.reviews.map((r: any) => (
                      <div key={r.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-9 h-9 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-600 shrink-0">{r.name[0]}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-800">{r.name}</p>
                            <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1 rounded">
                              {r.rating}<Star className="w-2.5 h-2.5 fill-white" />
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>
        </div>
      </div>

      <ProductRail title="You Might Also Like" products={related} tone="cream" />
    </div>
  )
}

function OptionBlock({ title, required, children }: { title: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-2.5 text-sm">
        {title}{required && <span className="text-rose-500 ml-1 text-xs font-medium">*required</span>}
      </h3>
      {children}
    </div>
  )
}

function ChoiceButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
        selected ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-600 hover:border-rose-300'
      }`}
    >
      {children}
    </button>
  )
}

function Section({ title, defaultOpen = false, id, children }: { title: string; defaultOpen?: boolean; id?: string; children: React.ReactNode }) {
  return (
    <details id={id} open={defaultOpen} className="group px-5 py-4 scroll-mt-24">
      <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}
