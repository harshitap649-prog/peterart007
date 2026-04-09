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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/hero.webp')" }}
      />
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-10" />
      
      {/* Content Container */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl w-full">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Peter Art
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover and buy beautiful artworks from talented artists
          </p>
          
          {/* Buttons Container */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <button
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold text-lg rounded-xl hover:bg-gray-100 transition-colors duration-200 min-w-[160px]"
            >
              Login
            </button>
            
            <button
              onClick={() => router.push('/login?mode=register')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-semibold text-lg rounded-xl border-2 border-white hover:bg-white hover:text-black transition-all duration-200 min-w-[160px]"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

