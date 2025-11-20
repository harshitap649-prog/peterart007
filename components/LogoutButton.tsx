'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiLogOut } from 'react-icons/fi'

interface LogoutButtonProps {
  className?: string
}

export default function LogoutButton({ className = '' }: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Logout failed')
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className={`flex items-center gap-1.5 rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-gray-900/30 transition hover:-translate-y-0.5 hover:bg-black ${className}`}
      >
        <FiLogOut className="text-base" />
        <span className="hidden sm:inline">Logout</span>
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/30 bg-white/95 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-20 right-6 h-32 w-32 rounded-full bg-orange-100 blur-3xl" />
            <div className="absolute -bottom-24 left-4 h-40 w-40 rounded-full bg-pink-100 blur-3xl" />
            <div className="relative grid gap-6 p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg shadow-gray-900/40">
                  <FiLogOut className="text-2xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Session</p>
                  <h3 className="text-2xl font-bold text-gray-900">Confirm Logout</h3>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                Are you sure you want to log out? You can sign back in anytime to keep managing Peter Art.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-2xl bg-gray-900 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/40 transition hover:-translate-y-0.5 hover:bg-black"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

