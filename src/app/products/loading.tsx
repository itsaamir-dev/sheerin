export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-24">
      <div className="bg-white border-b border-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-9 w-36 skeleton rounded-xl mb-2" />
          <div className="h-4 w-52 skeleton rounded-lg mb-6" />
          <div className="h-12 w-80 skeleton rounded-xl" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-28 skeleton rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-3 skeleton rounded w-1/2" />
                <div className="h-4 skeleton rounded w-4/5" />
                <div className="h-3 skeleton rounded w-1/3" />
                <div className="h-6 skeleton rounded w-2/5 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
