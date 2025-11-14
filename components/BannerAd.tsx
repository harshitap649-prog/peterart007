'use client'

import { useEffect, useRef } from 'react'

export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Wait for container to be ready
    if (!containerRef.current) return

    // Check if scripts already exist
    if (document.getElementById('ad-config') || document.getElementById('ad-script')) {
      return
    }

    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      // Load Adsterra ad configuration
      const script1 = document.createElement('script')
      script1.type = 'text/javascript'
      script1.innerHTML = `
        var atOptions = {
          'key' : '0fbc6e323c9390d9ca4f10e36841673e',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `
      script1.id = 'ad-config'
      // Append to body as Adsterra typically expects
      document.body.appendChild(script1)
      
      // Load Adsterra ad invoke script
      const script2 = document.createElement('script')
      script2.type = 'text/javascript'
      script2.src = 'https://www.highperformanceformat.com/0fbc6e323c9390d9ca4f10e36841673e/invoke.js'
      script2.id = 'ad-script'
      script2.async = true
      document.body.appendChild(script2)
    }, 100)

    return () => {
      clearTimeout(timer)
      // Cleanup on unmount
      const configScript = document.getElementById('ad-config')
      const adScript = document.getElementById('ad-script')
      if (configScript) configScript.remove()
      if (adScript) adScript.remove()
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
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      ></div>
    </div>
  )
}

