'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// import { getCurrentUser, isAdmin } from '@/lib/auth'
// import AdminDashboard from '@/components/AdminDashboard'

// Temporary placeholder
const AdminDashboard = () => <div>Admin Dashboard Placeholder</div>
const getCurrentUser = () => Promise.resolve(null)
const isAdmin = (user?: any) => Promise.resolve(false)

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
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
        router.push('/login')
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
        router.push('/login')
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff3eb] via-white to-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-0 py-0 md:px-4 md:py-6 md:py-10">
        <div className="rounded-none md:rounded-3xl border-0 md:border border-white/70 bg-white/95 p-0 md:p-4 shadow-none md:shadow-[0_45px_120px_-60px_rgba(15,23,42,0.55)] backdrop-blur md:p-6">
          <AdminDashboard />
        </div>
      </div>
    </div>
  )
}

