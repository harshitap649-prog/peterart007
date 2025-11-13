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
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }
      
      const admin = await isAdmin(currentUser)
      if (!admin) {
        router.push('/user')
        return
      }
      
      setUser(currentUser)
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/')
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
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
          <LogoutButton />
        </div>
        <AdminDashboard />
      </div>
    </div>
  )
}

