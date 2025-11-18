'use client'

import { useEffect, useRef, useState } from 'react'

export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null)
  const adLoadedRef = useRef(false)
  const [adReady, setAdReady] = useState(false)
  const [adError, setAdError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (adLoadedRef.current) return

    const injectIframe = () => {
      // Remove any previously injected floating ad containers
      const strayAds = document.querySelectorAll('iframe[src*="highperformanceformat"], div[id^="at-"]')
      strayAds.forEach((node) => {
        if (containerRef.current && !containerRef.current.contains(node)) {
          node.parentElement?.removeChild(node)
        }
      })

      const container = containerRef.current
      if (!container) return

      container.innerHTML = ''
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
      iframe.onload = () => {
        adLoadedRef.current = true
        setAdReady(true)
        setAdError(false)
      }
      iframe.onerror = () => {
        setAdError(true)
      }

      container.appendChild(iframe)

      // Fallback: if iframe still not rendered after 3s, show error notice
      setTimeout(() => {
        if (!adLoadedRef.current) {
          setAdError(true)
        }
      }, 3000)
    }

    const initializeAd = () => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        injectIframe()
      } else {
        window.addEventListener('load', injectIframe, { once: true })
      }
    }

    initializeAd()

    return () => {
      window.removeEventListener('load', injectIframe)
    }
  }, [])

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[9999] py-2"
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
        zIndex: 9999
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
          zIndex: 10000,
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
