'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    router.replace('/user')
    // Small delay to ensure redirect happens
    setTimeout(() => setLoading(false), 100)
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

  return null
}

