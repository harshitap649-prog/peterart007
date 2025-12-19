'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiX } from 'react-icons/fi'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: any) => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Login required</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-center">
          <p className="text-sm text-gray-600">
            To complete this action you need to login first. Your progress will be saved once you sign in.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="btn-secondary px-5 py-2 text-sm font-semibold"
            >
              Not now
            </button>
            <button
              onClick={() => {
                router.push('/login')
                onClose()
              }}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-black text-white hover:bg-gray-900 transition-colors"
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

