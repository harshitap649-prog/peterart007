'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
import AdminDashboard from '@/components/AdminDashboard'

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
          <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff3eb] via-white to-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:py-10">
        <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_45px_120px_-60px_rgba(15,23,42,0.7)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">Admin Console</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">Operational Control Center</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Monitor orders, artists, users, and support requests in one streamlined surface optimised for desktop and mobile.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-sm text-gray-600">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Logged in as</p>
                <p className="text-sm font-semibold text-gray-900">{user?.email || 'Admin'}</p>
              </div>
              <LogoutButton className="px-5 py-3" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/95 p-4 shadow-[0_45px_120px_-60px_rgba(15,23,42,0.55)] backdrop-blur md:p-6">
          <AdminDashboard />
        </div>
      </div>
    </div>
  )
}

