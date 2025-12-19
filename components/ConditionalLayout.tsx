'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import MobileDock from '@/components/MobileDock'
import BannerAd from '@/components/BannerAd'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isLoginPage = pathname === '/login'
  const isUserPage = pathname === '/user'
  const isArtworkPage = pathname?.startsWith('/artwork/')
  const isCartPage = pathname === '/cart'
  const isMessagesPage = pathname === '/messages' || pathname?.startsWith('/chat/')
  const isAdminPage = pathname === '/admin'
  const isArtistPage = pathname?.startsWith('/artist/')

  // All pages - no header or footer, but show mobile dock
  if (isUserPage) {
    // User page - full width on mobile
    // BannerAd is rendered inline in UserDashboard component
    return (
      <div className="app-shell">
        <main className="app-main pb-20 md:pb-8">
          <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
        </main>
        <Suspense fallback={null}>
          <MobileDock />
        </Suspense>
      </div>
    )
  }

  // Artwork details page - no mobile dock on mobile
  if (isArtworkPage) {
    return (
      <div className="app-shell">
        <main className="app-main pb-4 md:pb-8">
          <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
        </main>
        <BannerAd />
      </div>
    )
  }

  // Cart page - no mobile dock on mobile, no banner ad
  if (isCartPage) {
    return (
      <div className="app-shell">
        <main className="app-main pb-4 md:pb-8">
          <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
        </main>
      </div>
    )
  }

  // Messages page - no mobile dock on mobile, no banner ad, full screen
  if (isMessagesPage) {
    return (
      <div className="app-shell">
        <main className="app-main pb-0 md:pb-8">
          <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
        </main>
      </div>
    )
  }

  // Home page - no mobile dock, banner ad is in LoginPage component
  if (isHomePage) {
    return (
      <div className="app-shell">
        <main className="app-main pb-0 md:pb-8">
          <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
        </main>
      </div>
    )
  }

  // Login page - no mobile dock on mobile, banner ad is in LoginPage component (only 1 banner ad)
  if (isLoginPage) {
    return (
      <div className="app-shell">
        <main className="app-main pb-0 md:pb-8">
          <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
        </main>
      </div>
    )
  }

  // Admin page - no mobile dock, has its own bottom navigation
  if (isAdminPage) {
    return (
      <div className="app-shell">
        <main className="app-main pb-0 md:pb-8">
          <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
        </main>
      </div>
    )
  }

  // Artist page - banner ad is rendered inline in the page component
  if (isArtistPage) {
    return (
      <div className="app-shell">
        <main className="app-main pb-20 md:pb-8">
          <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
        </main>
        <Suspense fallback={null}>
          <MobileDock />
        </Suspense>
      </div>
    )
  }

  // All other pages - no header or footer, show mobile dock
  return (
    <div className="app-shell">
      <main className="app-main pb-20 md:pb-8">
        <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
      </main>
      <Suspense fallback={null}>
        <MobileDock />
      </Suspense>
      <BannerAd />
    </div>
  )
}

