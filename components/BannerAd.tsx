'use client'

import { useEffect, useRef, useState } from 'react'

export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const adLoadedRef = useRef(false)
  const [adReady, setAdReady] = useState(false)
  const [adError, setAdError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (adLoadedRef.current) return

    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const injectIframe = () => {
      if (!mounted) return

      const container = containerRef.current
      if (!container || !mounted) return

      // Safely remove any previously injected floating ad containers
      // Only remove nodes that are NOT children of our container
      try {
        const strayAds = document.querySelectorAll('iframe[src*="highperformanceformat"], div[id^="at-"]')
        strayAds.forEach((node) => {
          if (container && !container.contains(node) && node.parentElement) {
            try {
              // Double check the node is still in the DOM before removing
              if (node.parentElement && node.parentElement.contains(node)) {
                node.remove()
              }
            } catch (e) {
              // Ignore errors when removing stray nodes
            }
          }
        })
      } catch (error) {
        // Silently ignore DOM manipulation errors
        console.warn('BannerAd: Error cleaning up stray ads', error)
      }

      // Only inject if we haven't already injected
      if (iframeRef.current && container.contains(iframeRef.current)) {
        return
      }

      // Clear any existing iframes in the container safely
      try {
        const existingIframes = container.querySelectorAll('iframe')
        existingIframes.forEach((iframe) => {
          try {
            if (container.contains(iframe)) {
              // Use remove() instead of removeChild() to avoid React conflicts
              iframe.remove()
            }
          } catch (e) {
            // Ignore if already removed
          }
        })
      } catch (error) {
        // If React is managing this, just continue
        console.warn('BannerAd: Could not clear container', error)
      }

      const iframe = document.createElement('iframe')
      iframe.src = 'https://www.highperformanceformat.com/0fbc6e323c9390d9ca4f10e36841673e/invoke.html'
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
      
      iframeRef.current = iframe

      iframe.onload = () => {
        if (!mounted) return
        adLoadedRef.current = true
        setAdReady(true)
        setAdError(false)
        console.log('✅ Banner Ad: Iframe loaded successfully')
      }
      iframe.onerror = () => {
        if (!mounted) return
        setAdError(true)
        console.error('❌ Banner Ad: Iframe failed to load')
      }

      // Safely append iframe
      try {
        if (container && container.parentElement) {
          container.appendChild(iframe)
        }
      } catch (error) {
        console.warn('BannerAd: Error appending iframe', error)
        setAdError(true)
      }

      // Fallback: if iframe still not rendered after 3s, show error notice
      timeoutId = setTimeout(() => {
        if (mounted && !adLoadedRef.current) {
          setAdError(true)
        }
      }, 3000)
    }

    const loadHandler = () => {
      setTimeout(injectIframe, 100)
    }

    const initializeAd = () => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Small delay to ensure React has finished rendering
        console.log('Banner Ad: Initializing ad...')
        setTimeout(injectIframe, 100)
      } else {
        console.log('Banner Ad: Waiting for page load...')
        window.addEventListener('load', loadHandler, { once: true })
      }
    }

    initializeAd()

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // Clean up iframe reference safely
      if (iframeRef.current && containerRef.current) {
        try {
          const iframe = iframeRef.current
          const container = containerRef.current
          
          // Only remove if both elements are still in the DOM
          if (document.body.contains(container) && container.contains(iframe)) {
            // Use remove() instead of removeChild() to avoid React conflicts
            iframe.remove()
          }
        } catch (error) {
          // Ignore cleanup errors - React may have already removed it
        }
        iframeRef.current = null
      }
      
      // Remove event listener if it exists
      try {
        window.removeEventListener('load', loadHandler)
      } catch (error) {
        // Ignore
      }
    }
  }, [])

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[10000] py-2"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        pointerEvents: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 10000
      }}
    >
      <div 
        ref={containerRef}
        id="banner-ad-container"
        className="banner-ad-container"
        style={{ 
          minHeight: '50px', 
          minWidth: '320px', 
          maxWidth: '320px',
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
          pointerEvents: 'auto',
          zIndex: 10001,
          visibility: 'visible',
          opacity: 1
        }}
      >
        {/* Fallback message */}
        {(!adReady || adError) && (
          <div className="text-xs text-gray-500 absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-50 border border-dashed border-gray-300 rounded z-10">
            <div className="text-center p-2 leading-tight">
              <div className="font-semibold mb-1">Banner Ad</div>
              <div className="text-[10px]">320 x 50</div>
              <div className="text-[10px] mt-1 text-gray-700">
                {adError ? 'Unable to load ad. Disable ad blockers to support us.' : 'Loading ad...'}
              </div>
            </div>
          </div>
        )}
        {/* Adsterra will inject iframe ad here */}
      </div>
    </div>
  )
}
