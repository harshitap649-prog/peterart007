'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase.config'
import LoginPage from '@/components/LoginPage'

export const dynamic = 'force-dynamic'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    
    // Listen for auth state changes to handle logout and login
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        const admin = await isAdmin(currentUser)
        if (admin) {
          router.push('/admin')
        } else {
          router.push('/user')
        }
      } else {
        setUser(null)
        setLoading(false)
      }
    })
    
    return () => {
      unsubscribe()
    }
  }, [router])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        const admin = await isAdmin(currentUser)
        if (admin) {
          router.push('/admin')
        } else {
          router.push('/user')
        }
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
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

  // Only show login page if user is not authenticated
  if (!user) {
    return <LoginPage />
  }

  // If user is authenticated, show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-900 text-lg">Redirecting...</p>
      </div>
    </div>
  )
}

