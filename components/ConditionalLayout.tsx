'use client'

import { usePathname } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import MobileDock from '@/components/MobileDock'
import BannerAd from '@/components/BannerAd'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isUserPage = pathname === '/user'

  // All pages - no header or footer, but show mobile dock
  if (isUserPage) {
    // User page - full width on mobile
    // BannerAd is rendered inline in UserDashboard component
    return (
      <div className="app-shell">
        <main className="app-main pb-20 md:pb-8">
          <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
        </main>
        <MobileDock />
      </div>
    )
  }

  // All other pages - no header or footer, show mobile dock
  return (
    <div className="app-shell">
      <main className="app-main pb-20 md:pb-8">
        <div className="w-full md:mx-auto md:max-w-6xl md:space-y-6">{children}</div>
      </main>
      <MobileDock />
      <BannerAd />
    </div>
  )
}

