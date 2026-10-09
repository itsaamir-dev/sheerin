'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { displayOrderNumber } from '@/lib/order-number-format'

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-100 text-purple-700 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700 border-orange-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

export function AdminOrdersClient({ orders, activeStatus }: { orders: any[]; activeStatus?: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = orders.filter((o) =>
    !search || o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerPhone.includes(search) || o.orderNumber.toLowerCase().includes(search.toLowerCase())
  )

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success('Order status updated!')
        router.refresh()
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Error updating order')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm py-2"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => router.push(s === 'ALL' ? '/admin/orders' : `/admin/orders?status=${s}`)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                (s === 'ALL' && !activeStatus) || activeStatus === s
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Order ID</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Items</th>
                <th className="px-5 py-3 text-left">Delivery</th>
                <th className="px-5 py-3 text-left">Total</th>
                <th className="px-5 py-3 text-left">Payment</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-gray-500">{displayOrderNumber(order.orderNumber)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerPhone}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[140px]">{order.city}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      {order.items.slice(0, 2).map((item: any, i: number) => (
                        <p key={i} className="text-xs text-gray-600 truncate max-w-[160px]">
                          {item.productName} {item.variantName ? `(${item.variantName})` : ''} ×{item.quantity}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-700">{order.deliveryDate}</p>
                    <p className="text-xs text-gray-400 capitalize">{order.deliverySlot}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900">₹{order.total.toFixed(0)}</p>
                    {order.discount > 0 && (
                      <p className="text-xs text-green-600">-₹{order.discount} disc</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${
                      order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                      order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge border ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      <select
                        disabled={updating === order.id}
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white cursor-pointer disabled:opacity-50"
                      >
                        {STATUSES.filter((s) => s !== 'ALL').map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
