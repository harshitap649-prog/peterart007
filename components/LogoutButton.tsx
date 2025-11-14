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
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all bg-gray-900 text-white hover:bg-gray-800 ${className}`}
      >
        <FiLogOut className="text-base" />
        <span className="hidden sm:inline">Logout</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full bg-white">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="btn-primary flex-1"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

