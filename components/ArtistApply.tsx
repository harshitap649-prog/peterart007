'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithEmail, signUpWithEmail, loginWithGoogle, getCurrentUser } from '@/lib/auth'
import { getArtistByUserId } from '@/lib/artists'
import ArtistRegistration from '@/components/ArtistRegistration'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export default function ArtistApply() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [checkingArtist, setCheckingArtist] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
        // Check if user has already registered as artist
        setCheckingArtist(true)
        const artist = await getArtistByUserId(user.uid)
        if (artist) {
          // User has already registered, redirect to user dashboard
          toast.success('You have already registered as an artist. Redirecting to dashboard...')
          setTimeout(() => {
            router.push('/user')
          }, 1000)
          return
        }
        setCheckingArtist(false)
      } else {
        setCurrentUser(null)
      }
    } catch (error) {
      console.error('Error checking user', error)
    } finally {
      setChecking(false)
      setCheckingArtist(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await signUpWithEmail(email, password, name)
      if (!user) {
        toast.error('Registration failed. Please try again.')
        return
      }
      toast.success('Account created! Please complete artist registration.')
      await new Promise(resolve => setTimeout(resolve, 500))
      await checkUser()
    } catch (error: any) {
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
      // Check if user has already registered as artist
      const artist = await getArtistByUserId(user.uid)
      if (artist) {
        toast.success('Welcome back! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/user')
        }, 1000)
        return
      }
      toast.success('Welcome back! Continue your artist setup.')
      await new Promise(resolve => setTimeout(resolve, 500))
      await checkUser()
    } catch (error: any) {
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
      // Check if user has already registered as artist
      const artist = await getArtistByUserId(user.uid)
      if (artist) {
        toast.success('Welcome back! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/user')
        }, 1000)
        return
      }
      toast.success('Welcome! Complete your artist profile.')
      await new Promise(resolve => setTimeout(resolve, 500))
      await checkUser()
    } catch (error: any) {
      toast.error(error.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  if (checking || checkingArtist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">{checkingArtist ? 'Checking registration status...' : 'Preparing artist portal...'}</p>
        </div>
      </div>
    )
  }

  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <ArtistRegistration
            user={currentUser}
            onSuccess={() => {
              toast.success('Artist registration submitted! Redirecting to dashboard...')
              setTimeout(() => {
                router.push('/user')
              }, 2000)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Image and Quote */}
      <div className="relative w-full py-12 md:py-16 px-4 bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="mx-auto max-w-4xl text-center">
          {/* Image */}
          <div className="mb-6 flex justify-center">
            <img
              src="https://png.pngtree.com/png-vector/20240618/ourmid/pngtree-a-cute-girl-dancing-colorful-art-design-png-image_12793513.png"
              alt="Peter Art"
              className="w-48 h-auto md:w-64 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logoo.png'
              }}
            />
          </div>
          
          {/* Title and Subtitle */}
          <div className="space-y-2">
            <h1 className="text-xl md:text-4xl font-bold text-slate-900 leading-tight whitespace-nowrap">
              Fall in love with art — take one home today.
            </h1>
            <p className="text-sm md:text-lg text-slate-600 font-medium whitespace-nowrap">
              Turn Empty Walls into Expressions
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Become an Artist</h2>
            <p className="text-gray-600 text-sm md:text-base">
              Sign in or create an account to start selling your artwork and earning money.
            </p>
          </div>

        <div className="card p-6 space-y-5">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                mode === 'signin' 
                  ? 'bg-black text-white shadow-lg shadow-black/30' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:text-gray-900'
              }`}
            >
              Artist Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                mode === 'signup' 
                  ? 'bg-black text-white shadow-lg shadow-black/30' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:text-gray-900'
              }`}
            >
              Artist Sign Up
            </button>
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-black text-white font-bold shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Signing in...' : 'Sign In & Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-black text-white font-bold shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating account...' : 'Sign Up & Continue'}
              </button>
            </form>
          )}

          <div className="relative">
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="px-3 bg-white">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 btn-secondary py-2"
          >
            <FcGoogle className="text-xl" />
            <span>Continue with Google</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}

