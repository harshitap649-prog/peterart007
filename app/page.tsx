'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase.config'
import LoginPage from '@/components/LoginPage'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Set a maximum timeout to prevent infinite loading
    const maxTimeout = setTimeout(() => {
      console.log('Auth check timeout - showing login page')
      setLoading(false)
    }, 3000) // 3 second max timeout

    let unsubscribe: (() => void) | null = null
    let mounted = true

    const initializeAuth = async () => {
      try {
        // First, set up the auth state listener
        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (!mounted) return
          
          clearTimeout(maxTimeout)
          
          if (currentUser) {
            try {
              setUser(currentUser)
              const admin = await isAdmin(currentUser)
              if (admin) {
                router.push('/admin')
              } else {
                router.push('/user')
              }
            } catch (error) {
              console.error('Error checking admin status:', error)
              setUser(null)
              setLoading(false)
            }
          } else {
            setUser(null)
            setLoading(false)
          }
        })

        // Also try to get current user immediately
        try {
          const currentUser = await Promise.race([
            getCurrentUser(),
            new Promise((resolve) => setTimeout(() => resolve(null), 2000))
          ]) as any
          
          if (!mounted) return
          
          if (currentUser) {
            clearTimeout(maxTimeout)
            setUser(currentUser)
            try {
              const admin = await isAdmin(currentUser)
              if (admin) {
                router.push('/admin')
              } else {
                router.push('/user')
              }
            } catch (error) {
              console.error('Error checking admin status:', error)
              setUser(null)
              setLoading(false)
            }
          } else {
            clearTimeout(maxTimeout)
            setLoading(false)
          }
        } catch (error) {
          console.error('Auth check error:', error)
          if (mounted) {
            clearTimeout(maxTimeout)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          clearTimeout(maxTimeout)
          setLoading(false)
        }
      }
    }

    initializeAuth()
    
    return () => {
      mounted = false
      clearTimeout(maxTimeout)
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff3eb] via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-b from-[#fff3eb] via-white to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold text-lg">Redirecting...</p>
      </div>
    </div>
  )
}

