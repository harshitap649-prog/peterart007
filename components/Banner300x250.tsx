'use client'

import { useEffect, useRef, useState } from 'react'

interface Banner300x250Props {
  className?: string
  inline?: boolean
}

export default function Banner300x250({ className = "", inline = false }: Banner300x250Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      try {
        // Set up Adsterra options
        (window as any).atOptions = {
          'key': '182ddb7f90491714e91721e4781d7946',
          'format': 'iframe',
          'height': 250,
          'width': 300,
          'params': {}
        }

        // Create the ad script
        const script = document.createElement('script')
        script.src = 'https://www.highperformanceformat.com/182ddb7f90491714e91721e4781d7946/invoke.js'
        script.async = true
        
        script.onload = () => {
          setAdLoaded(true)
          console.log('✅ 300x250 banner loaded successfully')
        }
        
        script.onerror = () => {
          setAdError(true)
          console.error('❌ 300x250 banner failed to load')
        }
        
        if (containerRef.current) {
          containerRef.current.appendChild(script)
        }
      } catch (error) {
        console.error('❌ 300x250 banner error:', error)
        setAdError(true)
      }
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className={`banner-300x250-container ${className}`}>
      <div 
        ref={containerRef}
        className={`w-[300px] h-[250px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center ${
          inline ? 'mx-auto' : ''
        }`}
      >
        {!adLoaded && !adError && (
          <div className="text-center p-4">
            <div className="text-sm font-medium text-gray-700">Advertisement</div>
            <div className="text-xs text-gray-500 mt-1">300 x 250</div>
            <div className="text-xs text-gray-400 mt-1">Loading...</div>
          </div>
        )}
        {adError && (
          <div className="text-center p-4">
            <div className="text-sm font-medium text-gray-700">Advertisement</div>
            <div className="text-xs text-gray-500 mt-1">300 x 250</div>
            <div className="text-xs text-red-500 mt-1">Unable to load</div>
          </div>
        )}
      </div>
    </div>
  )
}
