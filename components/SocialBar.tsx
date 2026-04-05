'use client'

import { useEffect, useRef, useState } from 'react'
import { FiX } from 'react-icons/fi'

interface SocialBarProps {
  className?: string
}

export default function SocialBar({ className = "" }: SocialBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      try {
        // Create the profitablecpmrate network script
        const script = document.createElement('script')
        script.src = 'https://pl29060228.profitablecpmratenetwork.com/e9/ef/ed/e9efedf88012c8e81d9a5c0c49d1166e.js'
        script.async = true
        
        script.onload = () => {
          setAdLoaded(true)
          console.log('✅ Social bar loaded successfully')
        }
        
        script.onerror = () => {
          setAdError(true)
          console.error('❌ Social bar failed to load')
        }
        
        if (containerRef.current) {
          containerRef.current.appendChild(script)
        }
      } catch (error) {
        console.error('❌ Social bar error:', error)
        setAdError(true)
      }
    }, 2000) // Delayed load to avoid being intrusive

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className={`social-bar-container fixed bottom-0 left-0 right-0 z-40 ${className}`}>
      <div className="relative bg-white border-t border-gray-200 shadow-lg">
        {/* Close button for better UX */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 z-50 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close social bar"
        >
          <FiX className="w-4 h-4 text-gray-600" />
        </button>
        
        <div 
          ref={containerRef}
          className="w-full h-[60px] bg-gray-50 flex items-center justify-center px-4"
        >
          {!adLoaded && !adError && (
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">Social Content</div>
              <div className="text-xs text-gray-500">Loading social features...</div>
            </div>
          )}
          {adError && (
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">Social Content</div>
              <div className="text-xs text-gray-500">Unable to load</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
