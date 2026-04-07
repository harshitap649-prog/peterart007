'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebook, FaApple } from 'react-icons/fa'
import Link from 'next/link'
import { loginWithEmail, signUpWithEmail, loginWithGoogle, isAdmin } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function ModernLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let user;
      
      if (isLogin) {
        user = await loginWithEmail(email, password)
        toast.success('Login successful!')
      } else {
        if (!name.trim()) {
          toast.error('Please enter your name')
          return
        }
        user = await signUpWithEmail(email, password, name)
        toast.success('Account created successfully!')
      }
      
      if (!user) {
        throw new Error('Authentication failed')
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      
      const admin = await isAdmin(user)
      if (admin) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/'
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
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
          window.location.href = '/'
        }
      } catch (error: any) {
        console.error('Google login error:', error)
        toast.error(error.message || 'Google login failed')
      } finally {
        setLoading(false)
      }
    } else {
      toast.error(`${provider} login not implemented yet`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isLogin ? 'Welcome back! Glad to see you, Again!' : 'Hello! Register to get started'}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field w-full"
                required
              />
            </div>

            {/* Name Input - Only show for registration */}
            {!isLogin && (
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input-field w-full"
                  required
                />
              </div>
            )}

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Main Action Button */}
            <div className="my-8">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
              </button>
            </div>

            {/* Social Login Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600">Or {isLogin ? 'Login' : 'Register'} with</span>
              </div>
            </div>

            {/* Social Login Icons */}
            <div className="flex justify-center gap-6 mb-8">
              <button
                onClick={() => handleSocialLogin('facebook')}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              >
                <FaFacebook className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
              >
                <FcGoogle className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => handleSocialLogin('apple')}
                className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
              >
                <FaApple className="w-6 h-6" />
              </button>
            </div>
          </form>

          {/* Footer Text */}
          <div className="text-center mt-8">
            <span className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              {isLogin ? 'Register Now' : 'Login Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

