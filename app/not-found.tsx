'use client'

import { Suspense } from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff3eb] via-white to-white px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

