'use client'

import { useEffect, useRef, useState } from 'react'

interface NativeBannerProps {
  className?: string
}

export default function NativeBanner({ className = "" }: NativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      try {
        // Create the profitablecpmrate network script
        const script = document.createElement('script')
        script.async = true
        script.setAttribute('data-cfasync', 'false')
        script.src = 'https://pl29060229.profitablecpmratenetwork.com/981073617a35f6c6527b00954af2193c/invoke.js'
        
        script.onload = () => {
          setAdLoaded(true)
          console.log('✅ Native banner loaded successfully')
        }
        
        script.onerror = () => {
          setAdError(true)
          console.error('❌ Native banner failed to load')
        }
        
        if (containerRef.current) {
          containerRef.current.appendChild(script)
        }
      } catch (error) {
        console.error('❌ Native banner error:', error)
        setAdError(true)
      }
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className={`native-banner-container ${className}`}>
      <div 
        ref={containerRef}
        id="container-981073617a35f6c6527b00954af2193c"
        className="w-full min-h-[250px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center"
      >
        {!adLoaded && !adError && (
          <div className="text-center p-4">
            <div className="text-sm font-medium text-gray-700">Sponsored Content</div>
            <div className="text-xs text-gray-500 mt-1">Loading art supplies & courses...</div>
          </div>
        )}
        {adError && (
          <div className="text-center p-4">
            <div className="text-sm font-medium text-gray-700">Sponsored Content</div>
            <div className="text-xs text-gray-500 mt-1">Unable to load ad</div>
          </div>
        )}
      </div>
    </div>
  )
}
