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
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Override body background for home page with orange-to-white gradient
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set orange-to-white gradient background matching the Shutterstock image
      document.body.style.background = 'linear-gradient(to bottom, #ff8c42 0%, #ff9d5c 15%, #ffb380 30%, #ffc9a3 45%, #ffe0c9 60%, #fff0e6 75%, #ffffff 100%)'
      document.body.style.backgroundAttachment = 'fixed'
      document.body.style.backgroundSize = '100% 100%'
      document.body.style.minHeight = '100vh'
      // Remove pseudo-element backgrounds
      const style = document.createElement('style')
      style.textContent = `
        body::before,
        body::after {
          display: none !important;
        }
        html {
          height: 100%;
        }
        body {
          margin: 0;
          padding: 0;
        }
      `
      document.head.appendChild(style)
      
      return () => {
        document.body.style.background = ''
        document.body.style.backgroundAttachment = ''
        document.body.style.backgroundSize = ''
        document.body.style.minHeight = ''
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
      }
    }
  }, [])

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
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold text-lg">Redirecting...</p>
      </div>
    </div>
  )
}

