'use client'

import { usePathname } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import MobileDock from '@/components/MobileDock'
import BannerAd from '@/components/BannerAd'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/'

  if (isLoginPage) {
    // Login page - no header, footer, or mobile dock
    return (
      <div className="app-shell">
        <main className="min-h-screen">
          {children}
        </main>
        <BannerAd />
      </div>
    )
  }

  // All other pages - show header, footer, mobile dock
  return (
    <div className="app-shell">
      <div className="app-content">
        <SiteHeader />
        <main className="app-main pb-20 md:pb-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
        <SiteFooter />
      </div>
      <MobileDock />
      <BannerAd />
    </div>
  )
}

