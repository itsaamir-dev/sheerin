'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ShoppingCart, Search, Package } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

export function MobileBottomNav() {
  const path      = usePathname()
  const totalItems = useCartStore(s => s.totalItems())

  // Hide on admin pages
  if (path.startsWith('/admin')) return null

  const links = [
    { href: '/',            icon: Home,        label: 'Home'    },
    { href: '/products',    icon: ShoppingBag, label: 'Cakes'   },
    { href: '/track-order', icon: Package,     label: 'Track'   },
    { href: '/checkout',    icon: ShoppingCart, label: 'Cart', badge: totalItems },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg lg:hidden safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ href, icon: Icon, label, badge }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all relative ${
                active ? 'text-rose-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${active ? 'text-rose-600' : ''}`}>{label}</span>
              {active && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-600 rounded-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function FloatingWhatsApp() {
  const path = usePathname()
  // Product pages have their own WhatsApp button in the sticky add-to-cart bar on phones.
  const hideOnMobile = path.startsWith('/products/')
  return (
    <a
      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=Hi! I'd like to order a cake 🎂`}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl items-center justify-center transition-all hover:scale-110 hover:shadow-2xl ${hideOnMobile ? 'hidden lg:flex' : 'flex'}`}
      aria-label="Chat on WhatsApp"
    >
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  )
}
