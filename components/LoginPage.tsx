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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div
            className="relative w-32 h-32 md:w-44 md:h-44 mx-auto mb-4 overflow-hidden"
            style={{ borderRadius: '0 0 50% 50%' }}
          >
            <img
              src="https://png.pngtree.com/png-vector/20240618/ourmid/pngtree-a-cute-girl-dancing-colorful-art-design-png-image_12793513.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Peter Art</h1>
          <p className="text-gray-600 text-sm md:text-base italic">
            Fall in love with art — take one home today
          </p>
        </div>

        <div className="card p-4 md:p-6 lg:p-8">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 rounded-lg text-sm md:text-base font-medium transition-all ${
                activeTab === 'signin' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 rounded-lg text-sm md:text-base font-medium transition-all ${
                activeTab === 'signup' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-sm py-2"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-sm py-2"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-sm md:text-base py-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-sm py-2"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-sm py-2"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-sm py-2"
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-sm md:text-base py-2"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="relative my-5">
            <div className="relative flex justify-center text-xs md:text-sm">
              <span className="px-3 bg-white text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 btn-secondary text-sm md:text-base py-2 mb-3"
          >
            <FcGoogle className="text-xl" />
            <span>Sign in with Google</span>
          </button>

          <button
            onClick={() => router.push('/artist/apply')}
            className="w-full bg-black text-white py-2 rounded-lg text-sm md:text-base font-semibold shadow-md hover:bg-gray-900 transition-colors"
          >
            Become an Artist & Start Earning Money
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Already selling?{' '}
            <button
              onClick={() => router.push('/artist/apply')}
              className="text-orange-600 hover:underline font-medium"
            >
              Go to artist portal
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

