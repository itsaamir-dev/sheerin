export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-4 w-64 skeleton rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square skeleton rounded-2xl" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="w-20 h-20 skeleton rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-5">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-9 w-3/4 skeleton rounded-xl" />
            <div className="h-4 w-40 skeleton rounded" />
            <div className="h-20 skeleton rounded-2xl" />
            <div className="h-6 w-24 skeleton rounded" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-20 skeleton rounded-xl" />)}
            </div>
            <div className="h-6 w-24 skeleton rounded" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-24 skeleton rounded-xl" />)}
            </div>
            <div className="h-14 skeleton rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
