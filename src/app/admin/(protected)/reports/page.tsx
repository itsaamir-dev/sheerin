import { prisma } from '@/lib/prisma'

async function getReports() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [orders, topProducts] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, total: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),
  ])

  // Group by day
  const dailyMap: Record<string, { orders: number; revenue: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    dailyMap[key] = { orders: 0, revenue: 0 }
  }

  orders.forEach((o) => {
    const key = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    if (dailyMap[key]) {
      dailyMap[key].orders++
      dailyMap[key].revenue += o.total
    }
  })

  const statusCounts = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  })

  return { dailyData: Object.entries(dailyMap).map(([date, data]) => ({ date, ...data })), topProducts, statusCounts }
}

export default async function AdminReportsPage() {
  const { dailyData, topProducts, statusCounts } = await getReports()
  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue), 1)
  const maxOrders = Math.max(...dailyData.map((d) => d.orders), 1)

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-400', CONFIRMED: 'bg-blue-400', PROCESSING: 'bg-purple-400',
    OUT_FOR_DELIVERY: 'bg-orange-400', DELIVERED: 'bg-green-400', CANCELLED: 'bg-red-400',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Last 7 days performance overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-6">Daily Revenue (₹)</h2>
          <div className="flex items-end gap-3 h-40">
            {dailyData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-xs font-bold text-rose-600">
                  {d.revenue > 0 ? `₹${d.revenue.toFixed(0)}` : ''}
                </p>
                <div className="w-full bg-rose-50 rounded-t-lg relative" style={{ height: `${(d.revenue / maxRevenue) * 120}px`, minHeight: d.revenue > 0 ? '4px' : '2px' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg" />
                </div>
                <p className="text-[10px] text-gray-400 text-center">{d.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orders chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-6">Daily Orders</h2>
          <div className="flex items-end gap-3 h-40">
            {dailyData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-xs font-bold text-amber-600">
                  {d.orders > 0 ? d.orders : ''}
                </p>
                <div className="w-full rounded-t-lg relative" style={{ height: `${(d.orders / maxOrders) * 120}px`, minHeight: d.orders > 0 ? '4px' : '2px' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg" />
                </div>
                <p className="text-[10px] text-gray-400 text-center">{d.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.productName} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-400 text-amber-900' : 'bg-gray-100 text-gray-600'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.productName}</p>
                    <p className="text-xs text-gray-400">{p._sum.quantity} units sold</p>
                  </div>
                  <p className="text-sm font-bold text-rose-600">₹{p._sum.total?.toFixed(0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {statusCounts.map((s) => {
              const total = statusCounts.reduce((sum, x) => sum + x._count, 0) || 1
              const pct = Math.round((s._count / total) * 100)
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{s.status.replace(/_/g, ' ')}</span>
                    <span className="text-gray-500">{s._count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusColors[s.status] || 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
