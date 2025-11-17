/**
 * Loads and triggers a popunder ad
 * This should be called only at specific places: logout confirmation and order confirmation
 * Uses sessionStorage to prevent multiple triggers per action
 */
export function loadPopunderAd(action: 'logout' | 'order' = 'order') {
  // Only run in browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('Popunder ad: Not in browser environment')
    return
  }

  // Check if popunder was already triggered for this specific action in this session
  const popunderKey = `popunder-triggered-${action}`
  const popunderTriggered = sessionStorage.getItem(popunderKey)
  if (popunderTriggered === 'true') {
    console.log(`Popunder ad: Already triggered for ${action}`)
    return
  }

  // Mark as triggered for this specific action to prevent multiple popunders
  sessionStorage.setItem(popunderKey, 'true')
  console.log(`Popunder ad: Loading for ${action}`)

  // Remove any existing script first
  const existingScript = document.getElementById('popunder-ad-script')
  if (existingScript) {
    existingScript.remove()
  }

  // Create and load the popunder ad script - Use HTTPS explicitly
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://pl28052492.effectivegatecpm.com/09/f1/b1/09f1b13434062da4189385c5de300627.js'
  script.id = 'popunder-ad-script'
  script.async = true
  script.crossOrigin = 'anonymous'
  
  // Handle script load
  script.onload = () => {
    console.log('✅ Popunder ad: Script loaded successfully')
    console.log('📋 Popunder ad: Script will trigger on user interaction (click, etc.)')
    // Popunder ads typically trigger on user interaction
    // Keep script for a short time, then remove it
    setTimeout(() => {
      const scriptElement = document.getElementById('popunder-ad-script')
      if (scriptElement) {
        scriptElement.remove()
        console.log('📋 Popunder ad: Script removed after 10 seconds')
      }
    }, 10000) // Remove after 10 seconds to give ad time to trigger
  }
  
  script.onerror = (error) => {
    console.error('❌ Popunder ad: Failed to load script', error)
    console.error('🔍 Popunder ad: Check Network tab for failed request to effectivegatecpm.com')
    // Try with different approach as fallback
    const fallbackScript = document.createElement('script')
    fallbackScript.type = 'text/javascript'
    fallbackScript.src = 'https://pl28052492.effectivegatecpm.com/09/f1/b1/09f1b13434062da4189385c5de300627.js'
    fallbackScript.id = 'popunder-ad-script-fallback'
    fallbackScript.async = true
    fallbackScript.defer = false
    fallbackScript.crossOrigin = 'anonymous'
    fallbackScript.onload = () => {
      console.log('Popunder ad: Fallback script loaded successfully')
    }
    fallbackScript.onerror = () => {
      console.error('Popunder ad: Both script URLs failed to load')
      // Reset the flag on error so user can try again
      sessionStorage.removeItem(popunderKey)
    }
    document.body.appendChild(fallbackScript)
  }
  
  // Append to body (popunder ads work better when in body, not head)
  document.body.appendChild(script)
  console.log('Popunder ad: Script appended to body')
}

/**
 * Reset popunder trigger flags (call this when user logs out or starts new session)
 */
export function resetPopunderAd() {
  if (typeof window !== 'undefined' && sessionStorage) {
    sessionStorage.removeItem('popunder-triggered-logout')
    sessionStorage.removeItem('popunder-triggered-order')
  }
}

