'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    atOptions?: Record<string, unknown>
  }
}

export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const observerRef = useRef<MutationObserver | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [adReady, setAdReady] = useState(false)
  const [adError, setAdError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    const slot = slotRef.current
    if (!slot) return

    let mounted = true
    let currentRetryCount = 0

    const loadAd = () => {
      if (!mounted) return

      // Clean previous script/ad
      const existingScript = document.getElementById('adsterra-banner-script')
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript)
      }
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
      }
      slot.innerHTML = ''
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      // Use the existing slot div as the target container
      const placeholderId = 'banner-ad-slot'
      const placeholder = document.getElementById(placeholderId) || slot
      placeholder.innerHTML = ''
      placeholder.style.width = '320px'
      placeholder.style.height = '50px'
      placeholder.style.margin = '0 auto'
      placeholder.style.minHeight = '50px'
      placeholder.style.minWidth = '320px'
      placeholder.style.position = 'relative'
      placeholder.style.zIndex = '100'
      placeholder.style.visibility = 'visible'
      placeholder.style.opacity = '1'
      placeholder.style.display = 'block'

      // Observe for iframe insertion to mark ad ready
      observerRef.current = new MutationObserver((mutations) => {
        const iframe = slot.querySelector('iframe')
        const adSlot = document.getElementById(placeholderId)
        if (iframe || (adSlot && adSlot.innerHTML.trim() && adSlot.innerHTML.includes('iframe'))) {
          console.log('✅ Banner ad: Iframe detected!')
          setAdReady(true)
          setAdError(false)
          // Hide overlay immediately
          const overlay = slot.parentElement?.querySelector('.absolute.inset-0')
          if (overlay) {
            (overlay as HTMLElement).style.display = 'none'
          }
          if (observerRef.current) {
            observerRef.current.disconnect()
            observerRef.current = null
          }
        }
      })
      observerRef.current.observe(slot, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'style', 'display', 'visibility']
      })

      // Set Adsterra options BEFORE loading script
      window.atOptions = {
        key: '0fbc6e323c9390d9ca4f10e36841673e',
        format: 'iframe',
        height: 50,
        width: 320,
        params: {}
      }

      // Create and load script - Load in document body, not in slot
      const script = document.createElement('script')
      script.id = 'adsterra-banner-script'
      script.src = 'https://www.highperformanceformat.com/0fbc6e323c9390d9ca4f10e36841673e/invoke.js'
      script.async = true
      script.defer = false
      script.crossOrigin = 'anonymous'
      
      script.onload = () => {
        if (!mounted) return
        console.log('✅ Banner ad: Script loaded successfully')
        
        // Check multiple times for ad content
        let checkCount = 0
        const maxChecks = 10
        const checkInterval = setInterval(() => {
          if (!mounted || checkCount >= maxChecks) {
            clearInterval(checkInterval)
            return
          }
          checkCount++
          
          const adSlotElement = document.getElementById(placeholderId)
          const iframeElement = slot.querySelector('iframe')
          const hasAdContent = !!(adSlotElement && adSlotElement.innerHTML.trim() && 
            (adSlotElement.innerHTML.includes('iframe') || adSlotElement.innerHTML.includes('img') || adSlotElement.innerHTML.length > 100))
          
          if (iframeElement || hasAdContent) {
            clearInterval(checkInterval)
        setAdReady(true)
        setAdError(false)
            // Hide overlay
            const overlay = slot.parentElement?.querySelector('.absolute.inset-0')
            if (overlay) {
              (overlay as HTMLElement).style.display = 'none'
            }
            console.log('✅ Banner ad: Ad content detected and visible')
          } else if (checkCount >= maxChecks) {
            clearInterval(checkInterval)
            console.warn('⚠️ Banner ad: Script loaded but no ad content detected after checks')
            if (currentRetryCount < maxRetries) {
              currentRetryCount++
              setRetryCount(currentRetryCount)
              console.log(`🔄 Banner ad: Retrying... (${currentRetryCount}/${maxRetries})`)
              retryTimeoutRef.current = setTimeout(() => {
                if (mounted) loadAd()
              }, 3000 * currentRetryCount)
            } else {
        setAdError(true)
              console.error('❌ Banner ad: Max retries reached')
            }
          }
        }, 500) // Check every 500ms
      }
      
      script.onerror = (error) => {
        if (!mounted) return
        console.error('❌ Banner ad: Script failed to load', error)
        if (currentRetryCount < maxRetries) {
          currentRetryCount++
          setRetryCount(currentRetryCount)
          console.log(`🔄 Banner ad: Retrying... (${currentRetryCount}/${maxRetries})`)
          retryTimeoutRef.current = setTimeout(() => {
            if (mounted) loadAd()
          }, 3000 * currentRetryCount)
        } else {
          setAdError(true)
          setAdReady(false)
          console.error('❌ Banner ad: Max retries reached, giving up')
        }
      }
      
      // Append script inside the slot so the ad renders in place
      slot.appendChild(script)
      scriptRef.current = script
      console.log('📝 Banner ad: Script appended to slot')
    }

    // Initial load with small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (mounted) {
        console.log('🚀 Banner ad: Starting ad load...')
        loadAd()
      }
    }, 1000)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      const existingScript = document.getElementById('adsterra-banner-script')
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript)
      }
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      if (slot) {
        slot.innerHTML = ''
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 z-[10000] py-2 bg-transparent"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 10000,
        pointerEvents: 'none'
      }}
    >
      <div 
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
        <div
          ref={slotRef}
          id="banner-ad-slot"
          style={{
            width: '320px',
            height: '50px',
            minWidth: '320px',
            minHeight: '50px',
            position: 'relative',
            display: 'block',
            zIndex: 100,
            visibility: 'visible',
            opacity: 1
          }}
        />
        {(!adReady && !adError) && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-50 border border-dashed border-gray-300 rounded"
            style={{
              zIndex: 1,
              backgroundColor: 'rgba(249, 250, 251, 0.95)',
              display: adReady ? 'none' : 'flex'
            }}
          >
            <div className="text-center p-2 leading-tight">
              <div className="text-xs font-semibold text-gray-700 mb-1">Banner Ad</div>
              <div className="text-[10px] text-gray-500">320 x 50</div>
              <div className="text-[10px] mt-1 text-gray-600">Loading ad...</div>
            </div>
              </div>
        )}
        {adError && !adReady && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-50 border border-dashed border-gray-300 rounded"
            style={{
              zIndex: 1,
              backgroundColor: 'rgba(249, 250, 251, 0.95)'
            }}
          >
            <div className="text-center p-2 leading-tight">
              <div className="text-xs font-semibold text-gray-700 mb-1">Banner Ad</div>
              <div className="text-[10px] text-gray-500">320 x 50</div>
              <div className="text-[10px] mt-1 text-red-600">Unable to load ad. Disable ad blockers to support us.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
