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
      
      // Wait a bit for user state to be set
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if admin
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
      
      // Wait a bit for user state to be set
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if admin
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
      
      // Wait a bit for user state to be set
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if admin
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
        {/* Logo at top */}
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src="https://png.pngtree.com/png-clipart/20240310/original/pngtree-3d-colorful-beauty-girl-logo-white-background-png-image_14551483.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Peter Art</h1>
        </div>
        
        <div className="card p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'signin'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'signup'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-400">
              {activeTab === 'signin' ? 'Sign in to continue' : 'Create a new account'}
            </p>
          </div>

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Create a password (min 6 characters)"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-card text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 btn-secondary"
          >
            <FcGoogle className="text-2xl" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}

