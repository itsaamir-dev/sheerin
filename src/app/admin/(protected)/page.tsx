import { prisma } from '@/lib/prisma'
import { ShoppingBag, TrendingUp, Package, Tag, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { displayOrderNumber } from '@/lib/order-number-format'

async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalOrders, todayOrders, pendingOrders, totalRevenue,
    todayRevenue, totalProducts, activeCoupons, recentOrders
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: today } } }),
    prisma.product.count({ where: { available: true } }),
    prisma.coupon.count({ where: { active: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' }, take: 8,
      include: { items: { take: 1 } }
    }),
  ])

  return { totalOrders, todayOrders, pendingOrders, totalRevenue: totalRevenue._sum.total || 0, todayRevenue: todayRevenue._sum.total || 0, totalProducts, activeCoupons, recentOrders }
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, color: 'bg-rose-50 text-rose-600', trend: '+12%' },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toFixed(0)}`, icon: TrendingUp, color: 'bg-green-50 text-green-600', trend: '+8%' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-50 text-amber-600', trend: null },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600', trend: null },
    { label: 'Total Orders', value: stats.totalOrders, icon: CheckCircle, color: 'bg-purple-50 text-purple-600', trend: null },
    { label: 'Active Products', value: stats.totalProducts, icon: Package, color: 'bg-teal-50 text-teal-600', trend: null },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              {s.trend && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{s.trend}</span>
              )}
            </div>
            <p className="font-display text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h2 className="font-display font-bold text-lg text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-rose-600 font-semibold hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Order</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Items</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {displayOrderNumber(order.orderNumber)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.items.length} item(s)</td>
                  <td className="px-6 py-4 font-bold text-gray-900">₹{order.total.toFixed(0)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-rose-600 hover:text-rose-700 font-semibold text-xs">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
