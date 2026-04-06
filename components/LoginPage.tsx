'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginWithEmail, signUpWithEmail, loginWithGoogle, isAdmin } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import BannerAd from '@/components/BannerAd'
import InstallButton from '@/components/InstallButton'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isFromArtist = searchParams?.get('from') === 'artist' || searchParams?.get('redirect') === 'artist'

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
      } else if (isFromArtist) {
        // Redirect to artist registration form
        window.location.href = '/artist/apply'
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white">
      {/* Hero Section with Image and Quote */}
      <div className="relative w-full py-12 md:py-16 px-4 z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Image */}
          <div className="mb-6 flex justify-center">
            <img
              src="https://png.pngtree.com/png-vector/20240618/ourmid/pngtree-a-cute-girl-dancing-colorful-art-design-png-image_12793513.png"
              alt="Peter Art"
              className="w-32 h-auto md:w-48 lg:w-64 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logoo.png'
              }}
            />
          </div>
          
          {/* Title and Subtitle */}
          <div className="space-y-2">
            <h1 className="text-lg md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight whitespace-nowrap">
              Fall in love with art — take one home today.
            </h1>
            <p className="text-xs md:text-base lg:text-lg text-slate-600 font-medium whitespace-nowrap">
              Turn Empty Walls into Expressions
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 relative mx-auto w-full max-w-6xl px-3 py-10 sm:px-4 z-10">

        <div className="grid gap-4 md:gap-6">
        <div className="surface-card rounded-2xl md:rounded-[32px] border border-black/5 p-4 sm:p-6 md:p-8 lg:p-10 shadow-lift text-[var(--text-primary)] max-w-xs sm:max-w-sm mx-auto aspect-[4/3] sm:aspect-square flex flex-col justify-center">
          <div className="mb-4 md:mb-6 flex rounded-lg border border-black/10 bg-white p-0.5 md:p-1 text-xs md:text-sm font-semibold text-[var(--text-secondary)] shadow">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 rounded px-2 py-1.5 md:px-3 md:py-2 transition text-xs md:text-sm font-bold ${
                activeTab === 'signin' 
                  ? 'bg-black text-white shadow-lg shadow-black/30' 
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 rounded px-2 py-1.5 md:px-3 md:py-2 transition text-xs md:text-sm font-bold ${
                activeTab === 'signup' 
                  ? 'bg-black text-white shadow-lg shadow-black/30' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create account
            </button>
          </div>

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field rounded-xl text-sm md:text-base py-2.5 md:py-3 px-3"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field rounded-xl text-sm md:text-base py-2.5 md:py-3 px-3 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff className="text-lg md:text-xl" /> : <FiEye className="text-lg md:text-xl" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full justify-center rounded-xl bg-black text-white text-base md:text-lg font-bold shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all py-3 md:py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field rounded-xl text-sm md:text-base py-2.5 md:py-3 px-3"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field rounded-xl text-sm md:text-base py-2.5 md:py-3 px-3"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field rounded-xl text-sm md:text-base py-2.5 md:py-3 px-3 pr-10"
                    placeholder="Create a password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff className="text-lg md:text-xl" /> : <FiEye className="text-lg md:text-xl" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full justify-center rounded-xl bg-black text-white text-base md:text-lg font-bold shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all py-3 md:py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="relative py-4 md:py-5">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-black/5" />
            <div className="relative mx-auto w-max rounded-full border border-black/10 bg-white px-3 md:px-4 text-xs md:text-sm font-semibold uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--text-secondary)]">
              Or
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mb-4 md:mb-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-white py-2.5 md:py-3 text-sm md:text-base font-semibold text-[var(--text-primary)] transition hover:border-black/20 hover:shadow-md"
          >
            <FcGoogle className="text-lg md:text-xl" />
            Continue with Google
          </button>

          {/* PWA Install Button */}
          <div className="mb-2 md:mb-4">
            <InstallButton />
          </div>
        </div>
        
        {/* Banner Ad after sign in box */}
        <div className="w-full py-4 md:py-6">
          <BannerAd inline={true} />
        </div>
        </div>
      </div>
    </div>
  )
}

