import type { Metadata } from 'next'
import './globals.css'
import { Navbar }           from '@/components/layout/Navbar'
import { Footer }           from '@/components/layout/Footer'
import { CartDrawer }       from '@/components/cart/CartDrawer'
import { MobileBottomNav, FloatingWhatsApp } from '@/components/layout/MobileNav'
import { AddToOrderBar }    from '@/components/cart/AddToOrderBar'
import { StoreHydrator }    from '@/lib/cart-store'
import { Toaster }          from 'react-hot-toast'
import { prisma }           from '@/lib/prisma'
import { categoryProductCounts } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Sheerin — Fresh Cakes Delivered Today',
  description: 'Order custom cakes online. Birthday cakes, wedding cakes, photo cakes — delivered fresh the same day.',
  keywords: 'cake delivery, birthday cake, custom cake, order cake online, eggless cake',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  openGraph: {
    title: 'Sheerin — Fresh Cakes Delivered Today',
    description: 'Freshly baked custom cakes delivered to your door.',
    type: 'website',
  },
}

export const viewport = { themeColor: '#E11D48' }

// Static pages pick up category changes in the navbar within 5 minutes (the homepage refreshes every minute).
export const revalidate = 300

// Navbar shows the first few stocked categories, so the menu follows whatever admins set up.
async function getNavCategories() {
  try {
    const [categories, counts] = await Promise.all([
      prisma.category.findMany({ where: { showOnHome: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true, slug: true } }),
      categoryProductCounts(),
    ])
    return categories.filter((c) => (counts.get(c.id) ?? 0) > 0).slice(0, 4)
  } catch {
    return []
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navCategories = await getNavCategories()
  return (
    <html lang="en" className="scroll-smooth">
      <body className="pb-16 lg:pb-0">
        <StoreHydrator />
        <Navbar categories={navCategories} />
        <main className="min-h-screen">{children}</main>
        <Footer />

        {/* Overlays & persistent UI */}
        <CartDrawer />
        <MobileBottomNav />
        <AddToOrderBar />
        <FloatingWhatsApp />

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1D1D1D',
              color: '#fff',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
