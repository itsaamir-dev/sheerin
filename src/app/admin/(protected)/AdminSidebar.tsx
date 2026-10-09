'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Tag, BarChart3, LogOut, ChefHat, Settings, Grid3X3, Users, GalleryHorizontal, Bell } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/categories', label: 'Categories', icon: Grid3X3 },
  { href: '/admin/banners', label: 'Banners', icon: GalleryHorizontal },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="w-64 bg-[#1D0A0E] text-white flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-amber-400 rounded-xl flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold">Sheerin</p>
            <p className="text-xs text-white/40">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/admin' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-rose-600 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <Settings className="w-4 h-4" />
          View Store
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
