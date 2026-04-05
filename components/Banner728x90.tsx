'use client'

import { useEffect, useRef, useState } from 'react'

interface Banner728x90Props {
  className?: string
}

export default function Banner728x90({ className = "" }: Banner728x90Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      try {
        // Set up Adsterra options
        (window as any).atOptions = {
          'key': '40c25e9a2983a66e83a471c1a37bf087',
          'format': 'iframe',
          'height': 90,
          'width': 728,
          'params': {}
        }

        // Create the ad script
        const script = document.createElement('script')
        script.src = 'https://www.highperformanceformat.com/40c25e9a2983a66e83a471c1a37bf087/invoke.js'
        script.async = true
        
        script.onload = () => {
          setAdLoaded(true)
          console.log('✅ 728x90 banner loaded successfully')
        }
        
        script.onerror = () => {
          setAdError(true)
          console.error('❌ 728x90 banner failed to load')
        }
        
        if (containerRef.current) {
          containerRef.current.appendChild(script)
        }
      } catch (error) {
        console.error('❌ 728x90 banner error:', error)
        setAdError(true)
      }
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className={`banner-728x90-container ${className}`}>
      <div 
        ref={containerRef}
        className="w-full max-w-[728px] h-[90px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center mx-auto"
      >
        {!adLoaded && !adError && (
          <div className="text-center p-2">
            <div className="text-sm font-medium text-gray-700">Advertisement</div>
            <div className="text-xs text-gray-500">728 x 90</div>
            <div className="text-xs text-gray-400 mt-1">Loading...</div>
          </div>
        )}
        {adError && (
          <div className="text-center p-2">
            <div className="text-sm font-medium text-gray-700">Advertisement</div>
            <div className="text-xs text-gray-500 mt-1">728 x 90</div>
            <div className="text-xs text-red-500 mt-1">Unable to load</div>
          </div>
        )}
      </div>
    </div>
  )
}
