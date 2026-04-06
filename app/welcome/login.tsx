'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebook, FaApple } from 'react-icons/fa'

export default function ModernLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSignup = searchParams?.get('mode') === 'signup'

  useEffect(() => {
    // Add background pattern
    const style = document.createElement('style')
    style.textContent = `
      .topographic-pattern {
        background-image: 
          radial-gradient(circle at 30% 20%, rgba(255, 192, 203, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(230, 230, 250, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(191, 255, 0, 0.2) 0%, transparent 60%);
        background-size: 500px 500px, 600px 600px, 700px 700px;
        background-position: 0 0, 150px 150px, 200px 100px;
        animation: float 20s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(1deg); }
      }
      
      .pocket-container {
        border-radius: 2rem 2rem 4rem 4rem;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }
      
      .glow-button {
        background: linear-gradient(135deg, #FFC0CB, #E6E6FA);
        box-shadow: 0 0 20px rgba(255, 192, 203, 0.3);
        transition: all 0.3s ease;
      }
      
      .glow-button:hover {
        box-shadow: 0 0 30px rgba(255, 192, 203, 0.5);
        transform: translateY(-2px);
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (isSignup) {
        // Handle signup
        console.log('Signup:', { email, password, rememberMe })
      } else {
        // Handle login
        console.log('Login:', { email, password, rememberMe })
      }
      
      // Redirect to dashboard
      router.push('/user')
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
    // Implement social login logic
  }

  return (
    <div className="min-h-screen bg-welcome-gradient topographic-pattern relative overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => router.push('/welcome')}
        className="absolute top-6 left-6 flex items-center gap-2 text-text-primary hover:text-text-secondary transition-colors z-20"
      >
        <FiArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      {/* Main Container */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 flex items-end justify-center px-6 pb-8">
        <div className="pocket-container w-full max-w-md p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Welcome Back
            </h1>
            <p className="text-text-secondary">
              Ready to continue your learning journey? Your path is right here.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full px-4 py-3 rounded-2xl border border-input-border focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-input-border focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>

            {/* Form Controls */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-text-secondary text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-input-border text-brand-purple focus:ring-brand-pink"
                />
                Remember me
              </label>
              
              <button
                type="button"
                className="text-text-secondary text-sm hover:text-brand-purple transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full glow-button text-text-primary py-4 rounded-full font-semibold text-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-text-secondary">Sign in with</span>
            </div>
          </div>

          {/* Social Login Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              <FaFacebook className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-gray-300 transition-colors"
            >
              <FcGoogle className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => handleSocialLogin('apple')}
              className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
            >
              <FaApple className="w-6 h-6" />
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-text-secondary">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/welcome?mode=signup')}
              className="text-brand-purple font-semibold hover:underline"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
