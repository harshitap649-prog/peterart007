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
    <div className="relative mx-auto w-full max-w-6xl px-3 py-10 sm:px-4">
      <div className="absolute inset-0 -z-10 opacity-60 blur-3xl">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-orange-200/60" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-blue-200/50" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card rounded-[32px] border border-black/5 p-6 shadow-lift sm:p-8 text-[var(--text-primary)]">
          <div className="mb-6 flex rounded-full border border-black/10 bg-white p-1 text-sm font-semibold text-[var(--text-secondary)] shadow">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 rounded-full px-4 py-2 transition ${
                activeTab === 'signin' ? 'bg-white text-gray-900 shadow' : ''
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 rounded-full px-4 py-2 transition ${
                activeTab === 'signup' ? 'bg-white text-gray-900 shadow' : ''
              }`}
            >
              Create account
            </button>
          </div>

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field rounded-2xl text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field rounded-2xl text-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field rounded-2xl text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field rounded-2xl text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field rounded-2xl text-sm"
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="relative py-5">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-black/5" />
            <div className="relative mx-auto w-max rounded-full border border-black/10 bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
              Or
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-black/20"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <div className="rounded-3xl border border-black/5 bg-white p-4 text-sm text-[var(--text-secondary)] shadow-inner">
            <p className="font-semibold text-[var(--text-primary)]">Creator or gallery?</p>
            <p className="mb-3 text-sm">
              Launch your storefront, manage commissions, and access premium marketing tools.
            </p>
            <button
              onClick={() => router.push('/artist/apply')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-black/5"
            >
              Become an artist partner
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-[var(--text-secondary)]">
            Already selling?{' '}
            <button onClick={() => router.push('/artist/apply')} className="font-semibold text-[var(--text-primary)] hover:underline">
              Go to artist portal
            </button>
          </p>
        </div>

        <div className="glass-panel rounded-[40px] border border-black/5 p-6 sm:p-10 text-[var(--text-primary)]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">Trusted Art Marketplace</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-[var(--text-primary)] sm:text-4xl">
            Fall in love with art —
            <span className="gradient-text"> take one home today.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-[var(--text-secondary)]">
            Join thousands of collectors and artists using Peter Art to buy, sell, and commission bespoke artworks with seamless payments, multi-language support, and pro-grade order tracking.
          </p>

          <div className="hero-grid mt-8">
            {[
              { label: 'Artists onboarded', value: '1,200+' },
              { label: 'Commissions delivered', value: '8,500+' },
              { label: 'Average rating', value: '4.9/5' },
            ].map((metric) => (
              <div key={metric.label} className="metrics-tile">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
            {['Instant checkout', 'Secure payouts', 'Dedicated artist success', 'Live chat support'].map((point) => (
              <span key={point} className="chip">
                {point}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-4 rounded-3xl border border-black/5 bg-white p-5 sm:grid-cols-2">
            {[
              {
                title: 'Buy on mobile, manage on desktop',
                copy: 'Optimized for quick drops, deep dives, and bilingual support.',
              },
              {
                title: 'Commission in three taps',
                copy: 'Brief artists, track progress, and release payouts confidently.',
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{card.title}</p>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

