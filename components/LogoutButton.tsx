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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 p-4 md:p-8 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-md md:max-w-xl lg:max-w-2xl overflow-hidden rounded-3xl border border-white/30 bg-white/95 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-20 right-6 h-32 w-32 rounded-full bg-orange-100 blur-3xl" />
            <div className="absolute -bottom-24 left-4 h-40 w-40 rounded-full bg-pink-100 blur-3xl" />
            <div className="relative grid gap-6 p-6 md:p-8 lg:p-10">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg shadow-gray-900/40">
                  <FiLogOut className="text-2xl md:text-3xl" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Session</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Confirm Logout</h3>
                </div>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-gray-600">
                Are you sure you want to log out? You can sign back in anytime to keep managing Peter Art.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row md:gap-4">
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-2xl bg-gray-900 py-3 md:py-4 text-sm md:text-base font-semibold text-white shadow-lg shadow-gray-900/40 transition hover:-translate-y-0.5 hover:bg-black"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 md:py-4 text-sm md:text-base font-semibold text-gray-700 transition hover:bg-gray-50"
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

