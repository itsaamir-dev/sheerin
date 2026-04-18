'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, Search, ChefHat, User, LogIn } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

export function Navbar() {
  const pathname    = usePathname()
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQ,     setSearchQ]     = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const totalItems = useCartStore(s => s.totalItems())

  // Hide navbar on admin pages
  if (pathname.startsWith('/admin')) return null

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const navLinks = [
    { href: '/products',                   label: 'All Cakes'   },
    { href: '/products?category=birthday', label: 'Birthday'    },
    { href: '/products?category=wedding',  label: 'Wedding'     },
    { href: '/products?category=custom',   label: 'Custom'      },
    { href: '/about',                      label: 'About'       },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQ.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQ.trim())}`
      setSearchOpen(false)
      setSearchQ('')
    }
  }

  const isScrolledOrOpen = scrolled || mobileOpen

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolledOrOpen
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-rose-50'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-amber-400 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">Shee<span className="text-rose-600">rin</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map(link => {
              const active = pathname === link.href || pathname.startsWith(link.href.split('?')[0] + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative group ${
                    active ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-rose-500 transition-all duration-300 ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search cakes..."
                    className="w-44 lg:w-56 border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white shadow-sm"
                    onBlur={() => { if (!searchQ) setSearchOpen(false) }}
                  />
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQ('') }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-10 h-10 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>

            {/* Auth */}
            <Link
              href="/auth"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-rose-50 transition-colors"
              aria-label="Sign in"
            >
              <User className="w-5 h-5 text-gray-600" />
            </Link>

            {/* Cart */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-cart'))}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-rose-50 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-[slideUp_0.2s_ease-out]">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Order CTA */}
            <Link href="/checkout" className="hidden sm:flex btn-primary text-sm py-2.5 px-5">
              Order Now
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-rose-50 transition-colors"
              onClick={() => setMobileOpen(p => !p)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-rose-50 shadow-lg">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search cakes..."
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>
          </form>

          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/track-order"
              className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              Track Order
            </Link>
            <div className="border-t border-gray-100 my-2 pt-2 space-y-1">
              <Link href="/auth" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                <LogIn className="w-4 h-4" /> Sign In / Register
              </Link>
            </div>
            <Link href="/checkout" className="btn-primary text-center mt-1">
              Order Now 🎂
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
