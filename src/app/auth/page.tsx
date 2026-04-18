'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ChefHat } from 'lucide-react'
import toast from 'react-hot-toast'

function AuthInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/profile'

  const [mode,    setMode]    = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', password: '' })

  const up = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url  = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, phone: form.phone, password: form.password }

      const res  = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()

      if (data.user) {
        toast.success(mode === 'login' ? 'Welcome back! 👋' : 'Account created! 🎉')
        router.push(data.user.role === 'ADMIN' ? '/admin' : redirect)
        router.refresh()
      } else {
        toast.error(data.error || 'Something went wrong')
      }
    } catch {
      toast.error('Connection error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-amber-400 rounded-xl flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">Sheerin</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome back!' : 'Create account'}
          </h1>
          <p className="text-gray-500 mt-1">
            {mode === 'login' ? 'Sign in to track your orders' : 'Join to enjoy exclusive offers'}
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Toggle tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  required type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => up('name', e.target.value)}
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input
                required type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => up('email', e.target.value)}
                className="input-field"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={e => up('phone', e.target.value)}
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  required
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                  minLength={mode === 'register' ? 8 : undefined}
                  value={form.password}
                  onChange={e => up('password', e.target.value)}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base mt-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
                : mode === 'login' ? 'Sign In →' : 'Create Account →'
              }
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Forgot password?{' '}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=Hi! I forgot my Sheerin password for ${form.email}`}
                target="_blank" rel="noopener noreferrer"
                className="text-rose-600 hover:underline font-medium"
              >
                Contact us on WhatsApp
              </a>
            </p>
          )}
        </div>

        {/* Coupon nudge */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            🎁 New users get <span className="font-bold text-rose-600">10% off</span> — use code{' '}
            <span className="font-mono font-bold text-gray-800">WELCOME10</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthInner />
    </Suspense>
  )
}
