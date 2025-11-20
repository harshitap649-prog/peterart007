'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithEmail, signUpWithEmail, loginWithGoogle, isAdmin } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!name.trim()) {
        toast.error('Please enter your name')
        return
      }

      const user = await signUpWithEmail(email, password, name)
      if (!user) {
        toast.error('Registration failed. Please try again.')
        return
      }

      toast.success('Account created successfully!')
      await new Promise(resolve => setTimeout(resolve, 500))

      const admin = await isAdmin(user)
      if (admin) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/user'
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await loginWithEmail(email, password)
      if (!user) {
        toast.error('Login failed. Please try again.')
        return
      }

      toast.success('Login successful!')
      await new Promise(resolve => setTimeout(resolve, 500))

      const admin = await isAdmin(user)
      if (admin) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/user'
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const user = await loginWithGoogle()
      if (!user) {
        toast.error('Google login failed. Please try again.')
        return
      }

      toast.success('Login successful!')
      await new Promise(resolve => setTimeout(resolve, 500))

      const admin = await isAdmin(user)
      if (admin) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/user'
      }
    } catch (error: any) {
      console.error('Google login error:', error)
      toast.error(error.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden px-4 py-10 sm:py-16">
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-8 top-12 h-48 w-48 rounded-full bg-orange-100 blur-3xl" />
        <div className="absolute right-8 bottom-12 h-64 w-64 rounded-full bg-pink-100 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-3xl p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Trusted Art Marketplace</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Fall in love with art —
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text"> take one home today.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-gray-600">
            Join thousands of collectors and artists using Peter Art to buy, sell, and commission bespoke artworks with seamless payments, multi-language support, and pro-grade order tracking.
          </p>

          <div className="hero-grid mt-8">
            {[
              { label: 'Artists onboarded', value: '1,200+', accent: 'from-orange-100 to-white' },
              { label: 'Commissions delivered', value: '8,500+', accent: 'from-pink-100 to-white' },
              { label: 'Average rating', value: '4.9/5', accent: 'from-purple-100 to-white' }
            ].map((metric) => (
              <div
                key={metric.label}
                className={`metrics-tile bg-gradient-to-br ${metric.accent}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-gray-600">
            {['Instant checkout', 'Secure payouts', 'Dedicated artist success', 'Live chat support'].map((point) => (
              <span key={point} className="rounded-full border border-gray-200 px-4 py-1.5 font-medium">
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="card rounded-3xl border-0 bg-white/95 p-6 shadow-2xl shadow-orange-500/10 backdrop-blur sm:p-8">
          <div className="mb-6 flex rounded-2xl bg-gray-100 p-1 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 rounded-2xl px-4 py-2 transition ${
                activeTab === 'signin' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 rounded-2xl px-4 py-2 transition ${
                activeTab === 'signup' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
              }`}
            >
              Create account
            </button>
          </div>

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field rounded-2xl border-gray-200 text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field rounded-2xl border-gray-200 text-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-2xl py-3 text-sm font-semibold"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field rounded-2xl border-gray-200 text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field rounded-2xl border-gray-200 text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field rounded-2xl border-gray-200 text-sm"
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-2xl py-3 text-sm font-semibold"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="relative py-5">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-gray-200" />
            <div className="relative mx-auto w-max bg-white px-3 text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
              Or
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Creator or gallery?</p>
            <p className="mb-3 text-sm">Launch your storefront, manage commissions, and access premium marketing tools.</p>
            <button
              onClick={() => router.push('/artist/apply')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Become an artist partner
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-gray-500">
            Already selling?{' '}
            <button
              onClick={() => router.push('/artist/apply')}
              className="font-semibold text-gray-900 hover:underline"
            >
              Go to artist portal
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

