/**
 * Loads and triggers a popunder ad
 * This should be called after user actions like logout or order confirmation
 */
export function loadPopunderAd() {
  // Only run in browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  // Check if script already exists
  if (document.getElementById('popunder-ad-script')) {
    return
  }

  // Create and load the popunder ad script
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://pl28052492.effectivegatecpm.com/09/f1/b1/09f1b13434062da4189385c5de300627.js'
  script.id = 'popunder-ad-script'
  script.async = true
  
  // Append to body
  document.body.appendChild(script)
}

