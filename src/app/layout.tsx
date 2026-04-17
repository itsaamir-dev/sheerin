import type { Metadata } from 'next'
import './globals.css'
import { Navbar }           from '@/components/layout/Navbar'
import { Footer }           from '@/components/layout/Footer'
import { CartDrawer }       from '@/components/cart/CartDrawer'
import { MobileBottomNav, FloatingWhatsApp } from '@/components/layout/MobileNav'
import { Toaster }          from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Sheerin — Fresh Cakes Delivered Today',
  description: 'Order custom cakes online. Birthday cakes, wedding cakes, photo cakes — delivered fresh the same day.',
  keywords: 'cake delivery, birthday cake, custom cake, order cake online, eggless cake',
  openGraph: {
    title: 'Sheerin — Fresh Cakes Delivered Today',
    description: 'Freshly baked custom cakes delivered to your door.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="pb-16 lg:pb-0">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />

        {/* Overlays & persistent UI */}
        <CartDrawer />
        <MobileBottomNav />
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
