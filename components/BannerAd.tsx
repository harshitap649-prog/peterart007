'use client'

import { useEffect, useRef } from 'react'

export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null)
  const adLoadedRef = useRef(false)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // Prevent multiple loads
    if (adLoadedRef.current) return

    // Check if scripts already exist
    if (document.getElementById('ad-config-banner') || document.getElementById('ad-script-banner')) {
      adLoadedRef.current = true
      return
    }

    // Wait for container and DOM to be ready
    const initAd = () => {
      if (!containerRef.current) {
        return false
      }

      try {
        // Load Adsterra ad configuration - EXACT format from Adsterra
        const script1 = document.createElement('script')
        script1.type = 'text/javascript'
        script1.innerHTML = `
          atOptions = {
            'key' : '0fbc6e323c9390d9ca4f10e36841673e',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        `
        script1.id = 'ad-config-banner'
        document.head.appendChild(script1)
        
        // Wait a bit for config to be set, then load invoke script
        setTimeout(() => {
          // Load Adsterra ad invoke script - using protocol-relative URL
          const script2 = document.createElement('script')
          script2.type = 'text/javascript'
          script2.src = '//www.highperformanceformat.com/0fbc6e323c9390d9ca4f10e36841673e/invoke.js'
          script2.id = 'ad-script-banner'
          script2.async = true
          
          // Handle script load
          script2.onload = () => {
            adLoadedRef.current = true
            console.log('Banner ad script loaded successfully')
          }
          
          script2.onerror = () => {
            console.error('Failed to load banner ad script')
            adLoadedRef.current = false
          }
          
          document.body.appendChild(script2)
        }, 100)
        
        return true
      } catch (error) {
        console.error('Error loading banner ad:', error)
        return false
      }
    }

    // Initialize ad when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(() => initAd(), 500)
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => initAd(), 500)
      })
    }

    // Also try after a delay as fallback
    const timer = setTimeout(() => {
      if (!adLoadedRef.current) {
        initAd()
      }
    }, 1500)
    
    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40 bg-white border-t border-gray-200 py-2">
      <div 
        ref={containerRef}
        id="banner-ad-container"
        className="banner-ad-container"
        style={{ 
          minHeight: '50px', 
          minWidth: '320px', 
          display: 'block',
          position: 'relative',
          textAlign: 'center'
        }}
      ></div>
    </div>
  )
}

