'use client'

import { useState, useEffect } from 'react'
import { FiDownload, FiX } from 'react-icons/fi'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallButton(false)
      setDeferredPrompt(null)
      setIsInstalled(true)
    }

    checkIfInstalled()
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowInstallButton(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallButton(false)
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed or no install prompt available
  if (isInstalled || !showInstallButton || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-4 max-w-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FiDownload className="w-6 h-6" />
          <div>
            <p className="font-semibold text-sm">Install Peter Art</p>
            <p className="text-xs opacity-90">Add to home screen for quick access</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstallClick}
            className="bg-white text-orange-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-orange-50 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-orange-700 p-1 rounded-md transition-colors"
            aria-label="Dismiss"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
