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
          router.replace('/user')
        } else {
          router.replace('/welcome')
        }
      } catch (error) {
        router.replace('/welcome')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-welcome-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-primary font-semibold text-lg">Loading...</p>
      </div>
    </div>
  )
}

