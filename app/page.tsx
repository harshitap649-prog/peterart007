'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import LoginPage from '@/components/LoginPage'

export const dynamic = 'force-dynamic'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        const admin = await isAdmin(currentUser)
        setUserIsAdmin(admin)
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
          <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return <LoginPage />
}

