'use client'
import Link from 'next/link'
import { Star, Zap, Leaf, Settings } from 'lucide-react'

// ─── Why Choose Us ──────────────────────────────────────────────────────────
export function WhyChooseUs() {
  const features = [
    {
      icon: '⚡',
      title: 'Same-Day Delivery',
      desc: 'Order before 2 PM and get your cake delivered today. We never compromise on timing.',
      color: 'bg-amber-50 border-amber-100',
    },
    {
      icon: '🌿',
      title: 'Fresh Ingredients',
      desc: 'We use only the finest, freshest ingredients. No preservatives, no shortcuts.',
      color: 'bg-green-50 border-green-100',
    },
    {
      icon: '🎨',
      title: 'Easy Customization',
      desc: 'Choose size, flavor, message, and extras. Build your perfect cake in minutes.',
      color: 'bg-blue-50 border-blue-100',
    },
    {
      icon: '💯',
      title: '100% Satisfaction',
      desc: "Not happy? We'll make it right. Our customers\' smiles are our guarantee.",
      color: 'bg-rose-50 border-rose-100',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Why Us</p>
          <h2 className="section-title">Why Sheerin?</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">We're not just a bakery — we're your celebration partners.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className={`rounded-2xl border p-6 ${f.color} hover:shadow-md transition-shadow`}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ────────────────────────────────────────────────────────────
export function HowItWorks() {
  const steps = [
    { num: '01', emoji: '🎂', title: 'Select Your Cake', desc: 'Browse our collection and pick a cake that suits the occasion.' },
    { num: '02', emoji: '🎨', title: 'Customize It', desc: 'Choose size, flavor, add a message, and pick extras like candles.' },
    { num: '03', emoji: '📅', title: 'Choose Delivery', desc: 'Pick your preferred delivery date and time slot.' },
    { num: '04', emoji: '🎉', title: 'Enjoy!', desc: 'Sit back and we\'ll deliver a fresh, perfect cake to your door.' },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-[#1D0A0E] to-[#3D1A0A] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">Process</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">How It Works</h2>
          <p className="text-white/60 mt-3">Order your perfect cake in 4 simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-white/10" />

          {steps.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex flex-col items-center justify-center mb-5">
                <span className="text-3xl">{step.emoji}</span>
                <span className="text-xs font-bold text-amber-400 mt-1">{step.num}</span>
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/products" className="btn-gold inline-flex items-center gap-2">
            Start Your Order →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export interface HomeReview {
  id: string
  name: string
  rating: number
  comment: string
  image: string | null
  product: { name: string }
}

export function ReviewsSection({ reviews, stats }: { reviews: HomeReview[]; stats?: { avg: number; count: number } }) {
  const staticReviews = [
    { name: 'Priya Sharma', rating: 5, comment: 'Absolutely loved the chocolate truffle! Delivered fresh and on time.', product: 'Classic Chocolate Truffle', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=80' },
    { name: 'Rahul Mehta', rating: 5, comment: 'The customization options are amazing. My wife was thrilled!', product: 'Red Velvet Fantasy', image: null },
    { name: 'Sneha Patel', rating: 4, comment: 'Great cake, perfect for my daughter\'s birthday. Will order again!', product: 'Strawberry Dream', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80' },
    { name: 'Arjun Singh', rating: 5, comment: 'Same-day delivery? Unbelievable! The black forest was phenomenal.', product: 'Black Forest Delight', image: null },
    { name: 'Meena Reddy', rating: 5, comment: 'Best cake I\'ve ever tasted. The eggless option is superb!', product: 'Mango Delight', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80' },
    { name: 'Vikram Nair', rating: 4, comment: 'Excellent quality and packaging. Perfect for gifting!', product: 'Royal Wedding Cake', image: null },
  ]

  // Prefer real customer reviews; the curated set only fills in while there are too few.
  const real = reviews.map((r) => ({ name: r.name, rating: r.rating, comment: r.comment, product: r.product.name, image: r.image }))
  const shown = real.length >= 3 ? real.slice(0, 6) : staticReviews
  const useRealStats = real.length >= 3 && stats && stats.count > 0

  return (
    <section className="py-20 bg-[#FDF8F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Reviews</p>
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold text-gray-800">{useRealStats ? stats!.avg.toFixed(1) : '4.9'}</span>
            <span className="text-gray-500 text-sm">
              {useRealStats ? `from ${stats!.count.toLocaleString('en-IN')} review${stats!.count === 1 ? '' : 's'}` : 'from 2,000+ reviews'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((r, i) => (
            <div key={i} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-100 shrink-0">
                  {r.image ? (
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-rose-600">
                      {r.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.product}</p>
                </div>
                <div className="flex">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">"{r.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ──────────────────────────────────────────────────────────────
export function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-r from-rose-600 to-rose-700 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <p className="text-rose-200 font-semibold text-sm uppercase tracking-widest mb-3">Limited Offer</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Order your cake now —<br />
          <span className="text-amber-300">delivered today</span>
        </h2>
        <p className="text-rose-100 text-lg mb-8">Use code <strong className="text-white">WELCOME10</strong> for 10% off your first order</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/products" className="bg-white text-rose-600 font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:-translate-y-0.5 transition-all">
            Order Now 🎂
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}`}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Order on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
