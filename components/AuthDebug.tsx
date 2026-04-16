'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'

export default function AuthDebug() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        console.log('Auth Debug - Current user:', currentUser)
      } catch (err: any) {
        setError(err.message)
        console.error('Auth Debug - Error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div>Loading auth debug...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Authentication Debug Info:</h3>
      {error && <div className="text-red-600 mb-2">Error: {error}</div>}
      {user ? (
        <div>
          <div className="text-green-600">User is authenticated</div>
          <div>Email: {user.email}</div>
          <div>UID: {user.uid}</div>
        </div>
      ) : (
        <div className="text-orange-600">No user authenticated</div>
      )}
    </div>
  )
}
