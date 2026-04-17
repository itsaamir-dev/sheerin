export default function AdminLoading() {
  return (
    <div className="p-8">
      <div className="h-9 w-48 skeleton rounded-xl mb-2" />
      <div className="h-4 w-64 skeleton rounded mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="w-10 h-10 skeleton rounded-xl mb-3" />
            <div className="h-7 w-20 skeleton rounded mb-1" />
            <div className="h-4 w-32 skeleton rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="h-6 w-36 skeleton rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-6 py-4 border-b border-gray-50">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-4 w-32 skeleton rounded" />
            <div className="h-4 w-16 skeleton rounded" />
            <div className="h-4 w-16 skeleton rounded" />
            <div className="h-4 w-20 skeleton rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
