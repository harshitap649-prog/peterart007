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

  let scriptInjected = false

  const removeExistingScripts = () => {
    document.getElementById('popunder-ad-script')?.remove()
    document.getElementById('popunder-ad-script-fallback')?.remove()
  }

  const injectScript = () => {
    if (scriptInjected) return
    scriptInjected = true

    removeExistingScripts()

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://pl28052492.effectivegatecpm.com/09/f1/b1/09f1b13434062da4189385c5de300627.js'
    script.id = 'popunder-ad-script'
    script.async = true
    script.crossOrigin = 'anonymous'
    
    script.onload = () => {
      console.log('✅ Popunder ad: Script loaded successfully')
      // Remove after short delay so it can trigger
      setTimeout(() => {
        removeExistingScripts()
        console.log('📋 Popunder ad: Script removed after 10 seconds')
      }, 10000)
    }
    
    script.onerror = (error) => {
      console.error('❌ Popunder ad: Failed to load script', error)
      // Reset to allow retry
      sessionStorage.removeItem(popunderKey)
      scriptInjected = false
    }
    
    document.body.appendChild(script)
    console.log('Popunder ad: Script appended to body')
  }

  // Attempt immediate injection
  injectScript()

  // Also hook into the very next user interaction to ensure browsers treat it as user initiated
  const interactionEvents: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart']

  const handleInteraction = () => {
    interactionEvents.forEach((event) => document.removeEventListener(event, handleInteraction, true))
    if (!scriptInjected) {
      injectScript()
    }
  }

  interactionEvents.forEach((event) => document.addEventListener(event, handleInteraction, true))

  // Safety timeout to remove listeners after 5 seconds
  setTimeout(() => {
    interactionEvents.forEach((event) => document.removeEventListener(event, handleInteraction, true))
  }, 5000)
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

