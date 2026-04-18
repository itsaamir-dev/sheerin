'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Mail, Phone, Calendar, Package, ChevronRight,
  LogOut, Clock, CheckCircle, Truck, XCircle, ShoppingBag
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = {
  PENDING:          'bg-yellow-100 text-yellow-700',
  CONFIRMED:        'bg-blue-100 text-blue-700',
  PROCESSING:       'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED:        'bg-green-100 text-green-700',
  CANCELLED:        'bg-red-100 text-red-700',
}

const STATUS_ICON: Record<string, any> = {
  PENDING:          Clock,
  CONFIRMED:        CheckCircle,
  PROCESSING:       Clock,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED:        CheckCircle,
  CANCELLED:        XCircle,
}

type Order = {
  id: string
  orderNumber: string
  status: string
  createdAt: string | Date
  deliveryDate: string
  deliverySlot: string
  total: number
  items: { productName: string; variantName?: string | null; quantity: number }[]
}

type User = {
  id: string
  name: string
  email: string
  phone?: string | null
  createdAt: string | Date
}

export function ProfileClient({ user, orders }: { user: User; orders: Order[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'all' | 'active' | 'delivered'>('all')

  const filtered = orders.filter(o => {
    if (tab === 'active')    return !['DELIVERED', 'CANCELLED'].includes(o.status)
    if (tab === 'delivered') return o.status === 'DELIVERED'
    return true
  })

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    window.location.href = '/'
  }

  const activeCount    = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Profile card */}
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-amber-400 rounded-2xl flex items-center justify-center shadow-md shrink-0">
                <span className="text-2xl font-bold text-white">{user.name[0].toUpperCase()}</span>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 text-sm">Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <ShoppingBag className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-gray-900">My Orders</h2>
            <Link href="/track-order" className="text-sm text-rose-600 font-semibold hover:underline">
              Track by ID
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex bg-white border border-gray-100 rounded-xl p-1 mb-4 shadow-sm w-fit gap-1">
            {([
              { key: 'all',       label: `All (${orders.length})` },
              { key: 'active',    label: `Active (${activeCount})` },
              { key: 'delivered', label: `Delivered (${deliveredCount})` },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.key ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-14 h-14 mx-auto text-gray-200 mb-3" />
              <p className="font-semibold text-gray-500">No orders here yet</p>
              <Link href="/products" className="btn-primary mt-4 inline-block text-sm px-6 py-2.5">
                Browse Cakes
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(order => {
                const StatusIcon = STATUS_ICON[order.status] || Package
                const isActive   = !['DELIVERED', 'CANCELLED'].includes(order.status)
                return (
                  <div key={order.id} className="card p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono font-bold text-gray-900 text-sm">
                            #{order.orderNumber.slice(-10).toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            <StatusIcon className="w-3 h-3" />
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          Ordered {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}Deliver by {order.deliveryDate} ({order.deliverySlot})
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {order.items.map(i => `${i.productName}${i.variantName ? ` (${i.variantName})` : ''} ×${i.quantity}`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-rose-600 text-lg">₹{order.total.toFixed(0)}</p>
                        <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                      <Link
                        href={`/track-order?id=${order.orderNumber}`}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        {isActive ? 'Track Order' : 'View Details'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=Hi! I want to enquire about my order %23${order.orderNumber}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-semibold transition-all"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
