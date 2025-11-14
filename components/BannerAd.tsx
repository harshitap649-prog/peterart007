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
        // Create a unique container ID for this ad instance
        const adContainerId = 'at-' + Math.random().toString(36).substr(2, 9)
        if (containerRef.current) {
          containerRef.current.id = adContainerId
        }

        // Load Adsterra ad configuration - must be in global scope
        const script1 = document.createElement('script')
        script1.type = 'text/javascript'
        script1.innerHTML = `
          (function() {
            var atOptions = {
              'key' : '0fbc6e323c9390d9ca4f10e36841673e',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
            if (typeof window !== 'undefined') {
              window.atOptions = atOptions;
            }
          })();
        `
        script1.id = 'ad-config-banner'
        document.head.appendChild(script1)
        
        // Wait a bit for config to be set, then load invoke script
        setTimeout(() => {
          // Load Adsterra ad invoke script
          const script2 = document.createElement('script')
          script2.type = 'text/javascript'
          script2.src = 'https://www.highperformanceformat.com/0fbc6e323c9390d9ca4f10e36841673e/invoke.js'
          script2.id = 'ad-script-banner'
          script2.async = true
          script2.defer = true
          
          // Handle script load
          script2.onload = () => {
            adLoadedRef.current = true
            console.log('Banner ad script loaded successfully')
            
            // Try to manually trigger ad injection if script doesn't auto-inject
            setTimeout(() => {
              if (containerRef.current && (window as any).atOptions) {
                // Some Adsterra scripts auto-inject, but if not, we can try manual injection
                const container = containerRef.current
                if (container && container.children.length === 0) {
                  console.log('Banner ad container ready, waiting for ad to load...')
                }
              }
            }, 2000)
          }
          
          script2.onerror = () => {
            console.error('Failed to load banner ad script')
            adLoadedRef.current = false
          }
          
          document.body.appendChild(script2)
        }, 200)
        
        return true
      } catch (error) {
        console.error('Error loading banner ad:', error)
        return false
      }
    }

    // Initialize ad when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(() => initAd(), 800)
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => initAd(), 800)
      })
    }

    // Also try after a delay as fallback
    const timer = setTimeout(() => {
      if (!adLoadedRef.current) {
        initAd()
      }
    }, 2000)
    
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

