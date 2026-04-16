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
        if (user) {
          // User is authenticated, redirect to dashboard
          router.replace('/user')
        } else {
          // User not authenticated, redirect to login
          router.replace('/login')
        }
      } catch (error) {
        // Error checking auth, redirect to login
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

