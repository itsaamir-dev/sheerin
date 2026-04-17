import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Heart, Star, Truck, ChefHat } from 'lucide-react'

export default function AboutPage() {
  const team = [
    { name: 'Priya Sharma', role: 'Head Baker', emoji: '👩‍🍳', desc: '10 years of baking magic' },
    { name: 'Rajan Mehta',  role: 'Cake Artist', emoji: '🎨', desc: 'Award-winning decorator' },
    { name: 'Anita Rao',    role: 'Customer Joy', emoji: '🌟', desc: 'Makes every order perfect' },
  ]

  const values = [
    { icon: Heart,    title: 'Made with Love',     desc: 'Every cake is handcrafted with care and passion.' },
    { icon: Star,     title: 'Premium Quality',    desc: 'Only the finest, freshest ingredients in every bite.' },
    { icon: Truck,    title: 'Fast Delivery',       desc: 'Same-day delivery available when you order before 2 PM.' },
    { icon: ChefHat,  title: 'Expert Bakers',      desc: 'Over a decade of combined baking expertise.' },
  ]

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-600 to-rose-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="text-6xl mb-4">🎂</div>
          <h1 className="font-display text-5xl font-bold mb-4">About Sheerin</h1>
          <p className="text-rose-100 text-xl max-w-2xl mx-auto leading-relaxed">
            We're a family-run bakery passionate about making every celebration sweeter. 
            Freshly baked, lovingly crafted, delivered with a smile.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Our Story</p>
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-5">Baking happiness since 2015</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Sheerin started as a home kitchen dream — a mother's love for baking transformed into a community favourite.
              What began with birthday cakes for neighbours grew into a full-fledged bakery delivering joy across the city.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6">
              Today, we bake hundreds of custom cakes each month, each one made fresh to order with premium ingredients.
              No preservatives, no shortcuts — just pure, delicious cake made the right way.
            </p>
            <Link href="/products" className="btn-primary inline-flex">Order a Cake →</Link>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=500&fit=crop"
                alt="Our bakery"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <p className="font-bold text-gray-900">10,000+ Cakes</p>
                <p className="text-xs text-gray-400">Delivered with love</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#FDF8F3]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-gray-900">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-rose-50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-gray-900">Meet Our Team</h2>
            <p className="text-gray-500 mt-2">The people who make every cake magical</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map(m => (
              <div key={m.name} className="text-center p-6 rounded-2xl bg-[#FDF8F3] border border-rose-50 hover:shadow-md transition-shadow">
                <div className="text-5xl mb-3">{m.emoji}</div>
                <h3 className="font-display font-bold text-gray-900 text-lg">{m.name}</h3>
                <p className="text-rose-600 font-semibold text-sm">{m.role}</p>
                <p className="text-gray-500 text-sm mt-2">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-[#FDF8F3]" id="contact">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-gray-900">Get in Touch</h2>
            <p className="text-gray-500 mt-2">We're always happy to hear from you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact info */}
            <div className="space-y-5">
              {[
                { icon: Phone,   title: 'Phone',    val: '+91 98765 43210', href: 'tel:+919876543210' },
                { icon: Mail,    title: 'Email',    val: 'hello@sheerin.com', href: 'mailto:hello@sheerin.com' },
                { icon: MapPin,  title: 'Address',  val: '123 Baker Street, Mumbai, MH 400001', href: '#' },
                { icon: Clock,   title: 'Hours',    val: 'Mon–Sun: 8 AM – 9 PM', href: null },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{item.title}</p>
                    {item.href && item.href !== '#'
                      ? <a href={item.href} className="font-semibold text-gray-800 hover:text-rose-600 transition-colors">{item.val}</a>
                      : <p className="font-semibold text-gray-800">{item.val}</p>
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Quick order CTA */}
            <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl p-8 text-white flex flex-col justify-between">
              <div>
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-display text-2xl font-bold mb-2">Chat with us on WhatsApp</h3>
                <p className="text-rose-100 leading-relaxed mb-6">
                  Have a custom order in mind? Want to check today's availability?
                  We're just a message away — usually reply within minutes!
                </p>
              </div>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=Hi! I'd like to enquire about a custom cake order 🎂`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-rose-600 font-bold px-6 py-3.5 rounded-full hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Start WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
