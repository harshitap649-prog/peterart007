'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/firebase.config'

export default function FirebaseTest() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      if (auth) {
        setInitialized(true)
        console.log('Firebase Test - Auth initialized:', auth)
      } else {
        setError('Firebase Auth not initialized')
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Firebase Test - Error:', err)
    }
  }, [])

  return (
    <div className="p-4 bg-blue-50 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Firebase Connection Test:</h3>
      {error && <div className="text-red-600 mb-2">Error: {error}</div>}
      {initialized ? (
        <div className="text-green-600">Firebase Auth is properly initialized</div>
      ) : (
        <div className="text-orange-600">Firebase Auth not initialized</div>
      )}
    </div>
  )
}
