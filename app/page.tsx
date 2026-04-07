'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        // Don't redirect automatically - let users stay on home page
        // if (user) {
        //   router.replace('/user')
        // }
      } catch (error) {
        // User not logged in, stay on home page
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Logo at Top */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Peter Art</h1>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          {/* Centered Text */}
          <div className="text-center mb-12 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to Peter Art
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Discover and buy beautiful artworks from talented artists
            </p>
          </div>

          {/* Stacked Buttons */}
          <div className="w-full max-w-md space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="btn-primary w-full py-4 rounded-xl font-semibold text-lg"
            >
              Login
            </button>
            
            <button
              onClick={() => router.push('/login?mode=register')}
              className="btn-secondary w-full py-4 rounded-xl font-semibold text-lg"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

