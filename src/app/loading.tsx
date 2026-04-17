export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header skeleton */}
        <div className="h-10 w-48 skeleton rounded-xl mb-3" />
        <div className="h-5 w-72 skeleton rounded-lg mb-10" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-4 skeleton rounded-lg w-3/4" />
                <div className="h-3 skeleton rounded-lg w-1/2" />
                <div className="h-5 skeleton rounded-lg w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
