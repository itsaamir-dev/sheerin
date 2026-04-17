'use client'
import Link from 'next/link'
import { ArrowRight, Star, Clock, Truck } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FDF8F3]">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-100/60 to-amber-50/60 rounded-full translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-rose-50/80 to-transparent rounded-full -translate-x-1/4 translate-y-1/4" />
        {/* Floating emoji decorations */}
        <div className="absolute top-32 left-[8%] text-4xl animate-float" style={{ animationDelay: '0s' }}>🎂</div>
        <div className="absolute top-60 right-[12%] text-3xl animate-float" style={{ animationDelay: '1s' }}>🍰</div>
        <div className="absolute bottom-40 left-[15%] text-2xl animate-float" style={{ animationDelay: '2s' }}>🌸</div>
        <div className="absolute top-48 left-[45%] text-2xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Same-day delivery available
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Fresh Cakes{' '}
              <span className="relative">
                <span className="gradient-text">Delivered</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M0 6 Q50 0 100 5 Q150 10 200 4" stroke="#E63946" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
              <br />Today
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              Customize your perfect cake — choose size, flavor, and toppings. We bake fresh and deliver to your door within hours.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">4.9/5</span>
                <span className="text-sm text-gray-400">(2k+ reviews)</span>
              </div>
              <div className="w-px h-5 bg-gray-200" />
              <span className="text-sm text-gray-500">🎂 10,000+ cakes delivered</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="btn-primary flex items-center gap-2 text-base"
              >
                Order Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products?category=custom"
                className="btn-secondary flex items-center gap-2 text-base"
              >
                Customize Cake
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5 mt-8">
              {[
                { icon: Clock, label: 'Same-day delivery' },
                { icon: Truck, label: 'Free delivery ₹500+' },
                { icon: Star, label: '100% fresh' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-[380px] h-[380px] md:w-[480px] md:h-[480px]">
              {/* Glow background */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-amber-100 rounded-full blur-3xl opacity-60 scale-90" />

              {/* Main cake image */}
              <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop"
                  alt="Beautiful cake"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating cards */}
              <div className="absolute -left-8 top-1/3 bg-white rounded-2xl shadow-xl p-3.5 flex items-center gap-3 z-20 animate-float" style={{ animationDelay: '0.2s' }}>
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-xl">🎂</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Birthday Cakes</p>
                  <p className="text-xs text-gray-400">Starting ₹499</p>
                </div>
              </div>

              <div className="absolute -right-6 bottom-1/3 bg-white rounded-2xl shadow-xl p-3.5 flex items-center gap-3 z-20 animate-float" style={{ animationDelay: '1.2s' }}>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">✅</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Order Delivered!</p>
                  <p className="text-xs text-gray-400">2 mins ago</p>
                </div>
              </div>

              <div className="absolute top-4 right-0 bg-white rounded-2xl shadow-xl p-3 z-20 animate-float" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-700 mt-1">"Absolutely perfect!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
