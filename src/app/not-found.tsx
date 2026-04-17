import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 animate-float">🎂</div>
        <h1 className="font-display text-6xl font-bold text-gray-900 mb-2">404</h1>
        <p className="font-display text-2xl font-semibold text-gray-700 mb-3">
          Oops! This page doesn't exist
        </p>
        <p className="text-gray-400 mb-8">
          Looks like this slice has been eaten. Head back and find something delicious!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">← Back to Home</Link>
          <Link href="/products" className="btn-secondary">Browse Cakes</Link>
        </div>
      </div>
    </div>
  )
}
