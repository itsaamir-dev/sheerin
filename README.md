# 🎂 Sheerin — Full-Stack Cake E-Commerce Platform

A complete Next.js 14 e-commerce platform for a custom cake bakery, built with App Router, Prisma ORM, SQLite database, and a beautiful premium design.

---

## ✨ Features


### Customer-Facing
- 🏠 **Homepage** — Hero, categories, bestsellers, how-it-works, reviews, CTA
- 🛍️ **Product Listing** — Filter by category, search, sort by price/rating
- 🎂 **Product Detail** — Full customization (size, flavor, egg type, message, extras)
- 🛒 **Cart Drawer** — Slide-in cart with quantity controls, persisted across sessions
- 📦 **Checkout** — Full form with delivery date picker, time slots, coupon, payment
- ✅ **Order Success** — Confirmation with order number and WhatsApp contact
- 📍 **Order Tracking** — Real-time status with visual progress tracker
- 💬 **WhatsApp Integration** — Order via WhatsApp button on every product

### Admin Panel (`/admin`)
- 📊 **Dashboard** — Live stats: today's orders, revenue, pending count, recent orders table
- 📋 **Orders** — Full order list, filter by status, update order status inline
- 📦 **Products** — Product grid, toggle active/featured, add new products with variants
- 🏷️ **Coupons** — Create percentage/fixed coupons, toggle active, copy codes
- 📈 **Reports** — 7-day revenue + orders bar charts, top products, status breakdown

### Backend
- 🔐 JWT authentication with HTTP-only cookies
- 📡 RESTful API routes for all resources
- 🗄️ Prisma ORM with SQLite (easily swap to PostgreSQL)
- 🎫 Coupon validation with min-order, expiry, usage limits
- 📦 Order management with status workflow
- ⚡ Same-day delivery logic (before 2 PM cutoff)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd sheerin
npm install
```

### 2. Set Up Environment
The `.env` file is already created. Update if needed:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="919876543210"
```

### 3. Initialize Database
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```

Visit **http://localhost:3000**

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sheerin.com | admin123 |

Admin Panel: **http://localhost:3000/admin/login**

---

## 📁 Project Structure

```
sheerin/
├── prisma/
│   ├── schema.prisma       # Database schema (8 models)
│   └── seed.ts             # Seed data (6 products, 4 categories, 3 coupons)
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── products/                   # Product listing & detail
│   │   │   └── [slug]/                 # Dynamic product pages
│   │   ├── checkout/                   # Checkout flow
│   │   ├── order-success/              # Post-order confirmation
│   │   ├── track-order/                # Order tracking
│   │   ├── admin/                      # Admin panel (protected)
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── orders/                 # Order management
│   │   │   ├── products/               # Product management
│   │   │   ├── coupons/                # Coupon management
│   │   │   └── reports/                # Analytics
│   │   └── api/                        # API routes
│   │       ├── products/               # Products CRUD
│   │       ├── orders/                 # Orders CRUD
│   │       ├── coupons/                # Coupons CRUD + validate
│   │       └── auth/                   # Login / Logout
│   ├── components/
│   │   ├── home/                       # Homepage sections
│   │   ├── layout/                     # Navbar, Footer
│   │   └── cart/                       # CartDrawer
│   ├── lib/
│   │   ├── prisma.ts                   # DB client singleton
│   │   ├── auth.ts                     # JWT utilities
│   │   └── cart-store.ts               # Zustand cart state
│   └── types/                          # TypeScript interfaces
```

---

## 🎨 Design System

- **Primary**: `#E63946` (rose red)
- **Accent**: `#FFB703` (warm gold)
- **Background**: `#FDF8F3` (cream white)
- **Dark**: `#1D0A0E` (deep brown-black)
- **Fonts**: Playfair Display (headings) + DM Sans (body)

---

## 🔧 Production Deployment

### Switch to PostgreSQL
1. Install: `npm install @prisma/client`
2. Update `prisma/schema.prisma` datasource to `postgresql`
3. Update `DATABASE_URL` in `.env`
4. Run `npx prisma db push`

### Deploy to Vercel
```bash
npx vercel --prod
```

Set environment variables in Vercel dashboard.

---

## 📋 Available Coupons (from seed)

| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| WELCOME10 | Percentage | 10% | ₹200 |
| FLAT100 | Fixed | ₹100 | ₹500 |
| SWEET20 | Percentage | 20% | ₹800 |
