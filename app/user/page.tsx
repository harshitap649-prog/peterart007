'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import UserDashboard from '@/components/UserDashboard'
import LogoutButton from '@/components/LogoutButton'

export const dynamic = 'force-dynamic'

export default function UserPage() {
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
      if (currentUser) {
        console.log('User authenticated:', currentUser.email)
        setUser(currentUser)
      } else {
        console.log('No user found, allowing guest browsing')
        setUser(null)
      }
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      setLoading(false)
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
    <div className="min-h-screen p-3 md:p-4">
      <div className="container mx-auto">
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        }>
          <UserDashboard user={user} onUserUpdate={setUser} />
        </Suspense>
      </div>
    </div>
  )
}

