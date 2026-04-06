'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new modern login page
    router.replace('/welcome/login')
  }, [router])

  return (
    <div className="min-h-screen bg-welcome-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-primary font-semibold text-lg">Redirecting...</p>
      </div>
    </div>
  )
}

