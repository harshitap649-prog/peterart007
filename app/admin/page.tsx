'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
import AdminDashboard from '@/components/AdminDashboard'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Add a small delay to ensure Firebase is initialized
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        console.log('No user found, redirecting to login')
        router.push('/')
        return
      }
      
      const admin = await isAdmin(currentUser)
      if (!admin) {
        console.log('User is not admin, redirecting to user page')
        router.push('/user')
        return
      }
      
      setUser(currentUser)
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      // Don't redirect immediately on error, show error state
      setLoading(false)
      // Only redirect if it's a clear auth error
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="container mx-auto">
        <div className="flex justify-end items-center mb-4 md:mb-6">
          <LogoutButton />
        </div>
        <AdminDashboard />
      </div>
    </div>
  )
}

