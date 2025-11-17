'use client'

import { useEffect, useRef, useState } from 'react'

export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null)
  const adLoadedRef = useRef(false)
  const [adReady, setAdReady] = useState(false)

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
        console.log('Banner ad: Container not ready, retrying...')
        setTimeout(initAd, 200)
        return false
      }

      // Ensure container is visible and has dimensions
      const container = containerRef.current
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.log('Banner ad: Container not visible, retrying...')
        setTimeout(initAd, 200)
        return false
      }

      try {
        // Create a unique container ID for this ad instance
        const containerId = `at-${Date.now()}`
        container.id = containerId
        container.setAttribute('data-ad-container', 'true')
        
        // Method 1: Try direct iframe injection (most reliable for iframe format)
        const createDirectIframe = () => {
          if (containerRef.current && !containerRef.current.querySelector('iframe')) {
            const iframe = document.createElement('iframe')
            iframe.src = `https://www.highperformanceformat.com/0fbc6e323c9390d9ca4f10e36841673e/invoke.html`
            iframe.width = '320'
            iframe.height = '50'
            iframe.frameBorder = '0'
            iframe.scrolling = 'no'
            iframe.style.border = 'none'
            iframe.style.display = 'block'
            iframe.style.margin = '0 auto'
            iframe.style.width = '320px'
            iframe.style.height = '50px'
            iframe.allow = 'autoplay'
            iframe.allowFullscreen = false
            containerRef.current.appendChild(iframe)
            setAdReady(true)
            console.log('✅ Banner ad: Direct iframe created')
            return true
          }
          return false
        }

        // Try direct iframe first
        if (createDirectIframe()) {
          return true
        }

        // Method 2: Load Adsterra ad configuration - EXACT format from Adsterra
        const script1 = document.createElement('script')
        script1.type = 'text/javascript'
        script1.innerHTML = `
          window.atOptions = window.atOptions || {};
          window.atOptions = {
            'key' : '0fbc6e323c9390d9ca4f10e36841673e',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        `
        script1.id = 'ad-config-banner'
        document.head.appendChild(script1)
        console.log('✅ Banner ad: Configuration script added to head')
        
        // Wait a bit for config to be set, then load invoke script
        setTimeout(() => {
          // Load Adsterra ad invoke script - Use HTTPS explicitly
          const script2 = document.createElement('script')
          script2.type = 'text/javascript'
          script2.src = 'https://www.highperformanceformat.com/0fbc6e323c9390d9ca4f10e36841673e/invoke.js'
          script2.id = 'ad-script-banner'
          script2.async = true
          script2.defer = false
          script2.crossOrigin = 'anonymous'
          
          // Handle script load
          script2.onload = () => {
            adLoadedRef.current = true
            console.log('✅ Banner ad: Script loaded successfully')
            console.log('📋 Banner ad: atOptions available:', typeof (window as any).atOptions !== 'undefined')
            if ((window as any).atOptions) {
              console.log('📋 Banner ad: atOptions content:', (window as any).atOptions)
            }
            
            // Check if container is visible
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect()
              console.log('📐 Banner ad: Container position:', {
                visible: rect.width > 0 && rect.height > 0,
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                id: containerRef.current.id
              })
            }
            
            // Check for ad element after script loads - check multiple times
            const checkForAd = (attempt: number = 1) => {
              console.log(`🔍 Banner ad: Checking for ad element (attempt ${attempt}/15)...`)
              
              if (attempt > 15) {
                console.warn('⚠️ Banner ad: Ad element not found after 15 attempts')
                // Try to manually create ad if script didn't inject it
                if (containerRef.current && !containerRef.current.querySelector('iframe')) {
                  console.log('🔄 Banner ad: Attempting manual ad injection...')
                  // Create iframe manually as fallback
                  const iframe = document.createElement('iframe')
                  iframe.src = `https://www.highperformanceformat.com/0fbc6e323c9390d9ca4f10e36841673e/invoke.html`
                  iframe.width = '320'
                  iframe.height = '50'
                  iframe.frameBorder = '0'
                  iframe.scrolling = 'no'
                  iframe.style.border = 'none'
                  iframe.style.display = 'block'
                  iframe.style.margin = '0 auto'
                  containerRef.current.appendChild(iframe)
                  setAdReady(true)
                  console.log('✅ Banner ad: Manual iframe created')
                }
                return
              }
              
              if (containerRef.current) {
                const adElement = containerRef.current.querySelector('iframe, div[id*="at-"], a[href*="highperformanceformat"]')
                if (adElement) {
                  console.log('✅ Banner ad: Ad element found in container!', adElement)
                  setAdReady(true)
                  return
                }
              }
              
              // Check entire document for any ad-related elements
              const allAds = document.querySelectorAll('iframe[src*="highperformanceformat"], iframe[src*="adsterra"], div[id*="at-"]')
              if (allAds.length > 0) {
                console.log(`📊 Banner ad: Found ${allAds.length} potential ad-related elements in document`)
                // Try to move them to our container
                allAds.forEach((ad: any) => {
                  if (containerRef.current && ad.parentNode !== containerRef.current) {
                    try {
                      containerRef.current.appendChild(ad)
                      console.log('✅ Banner ad: Moved ad element to container')
                      setAdReady(true)
                    } catch (e) {
                      console.error('❌ Banner ad: Could not move ad element', e)
                    }
                  }
                })
              }
              
              // Check again after delay
              setTimeout(() => checkForAd(attempt + 1), 500)
            }
            
            // Start checking after 500ms
            setTimeout(() => checkForAd(), 500)
          }
          
          script2.onerror = (error) => {
            console.error('❌ Banner ad: Failed to load script', error)
            console.error('🔍 Banner ad: Check Network tab for failed request to highperformanceformat.com')
            adLoadedRef.current = false
            
            // Try manual iframe as fallback
            if (containerRef.current) {
              console.log('🔄 Banner ad: Trying manual iframe fallback...')
              const iframe = document.createElement('iframe')
              iframe.src = `https://www.highperformanceformat.com/0fbc6e323c9390d9ca4f10e36841673e/invoke.html`
              iframe.width = '320'
              iframe.height = '50'
              iframe.frameBorder = '0'
              iframe.scrolling = 'no'
              iframe.style.border = 'none'
              iframe.style.display = 'block'
              iframe.style.margin = '0 auto'
              containerRef.current.appendChild(iframe)
              setAdReady(true)
              console.log('✅ Banner ad: Manual iframe fallback created')
            }
          }
          
          document.body.appendChild(script2)
          console.log('📝 Banner ad: Invoke script appended to body')
        }, 200)
        
        return true
      } catch (error) {
        console.error('Banner ad: Error loading ad', error)
        return false
      }
    }

    // Initialize ad when DOM is ready
    const initializeAd = () => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => {
          if (!adLoadedRef.current) {
            initAd()
          }
        }, 300)
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => {
            if (!adLoadedRef.current) {
              initAd()
            }
          }, 300)
        })
      }
    }

    initializeAd()

    // Also try after a delay as fallback
    const timer = setTimeout(() => {
      if (!adLoadedRef.current && containerRef.current) {
        console.log('Banner ad: Fallback initialization')
        initAd()
      }
    }, 1000)
    
    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 py-2"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      <div 
        ref={containerRef}
        id="banner-ad-container"
        className="banner-ad-container"
        style={{ 
          minHeight: '50px', 
          minWidth: '320px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          margin: '0 auto',
          overflow: 'visible',
          width: '320px',
          height: '50px',
          padding: '0',
          background: 'transparent',
          pointerEvents: 'auto'
        }}
      >
        {/* Fallback message for debugging - only show if ad is not ready */}
        {!adReady && process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-50 border border-dashed border-gray-300 rounded z-10">
            <div className="text-center p-2">
              <div className="font-semibold mb-1">Banner Ad Container</div>
              <div className="text-[10px]">320x50</div>
              <div className="text-[10px] mt-1 text-orange-600">Loading ad...</div>
            </div>
          </div>
        )}
        {/* Adsterra will inject iframe ad here */}
      </div>
    </div>
  )
}

