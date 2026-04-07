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
    <div className="min-h-screen bg-blue-600 flex flex-col">
      {/* Logo at Top Left */}
      <div className="absolute top-6 left-6">
        <h1 className="text-2xl font-bold text-white">Peter Art</h1>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Centered Text */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to Peter Art
          </h2>
          <p className="text-xl text-white/90 max-w-md">
            Discover and buy beautiful artworks from talented artists
          </p>
        </div>

        {/* Stacked Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all duration-200"
          >
            Login
          </button>
          
          <button
            onClick={() => router.push('/login?mode=register')}
            className="w-full bg-transparent border-2 border-black text-black py-4 rounded-xl font-semibold text-lg hover:bg-black hover:text-white transition-all duration-200"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}

