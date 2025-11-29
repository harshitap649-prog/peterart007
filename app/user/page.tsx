'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import UserDashboard from '@/components/UserDashboard'
import LogoutButton from '@/components/LogoutButton'

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
        setLoading(false)
      } else {
        console.log('No user found, redirecting to login')
        // Redirect to login page if not authenticated
        router.push('/')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // Redirect to login on error
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)] px-4">
        <div className="text-center text-[var(--text-primary)]">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-black/10 border-t-transparent"></div>
          <p className="text-lg font-semibold text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-4 text-[var(--text-primary)] md:px-4">
      <div className="w-full md:container md:mx-auto">
        <Suspense
          fallback={
            <div className="py-12 text-center text-[var(--text-secondary)]">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-transparent"></div>
              <p>Loading...</p>
            </div>
          }
        >
          <UserDashboard user={user} onUserUpdate={setUser} />
        </Suspense>
      </div>
    </div>
  )
}

