import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/contexts/CartContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import MobileDock from '@/components/MobileDock'
import BannerAd from '@/components/BannerAd'
import ConditionalLayout from '@/components/ConditionalLayout'
import PWAInstallButton from '@/components/PWAInstallButton'
import useServiceWorker from '@/hooks/useServiceWorker'

export const metadata: Metadata = {
  title: 'Peter Art - Artwork Shop',
  description: 'Buy and sell beautiful artworks',
  manifest: '/manifest.json',
  themeColor: '#f97316',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Peter Art',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useServiceWorker()
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Peter Art" />
        <meta name="application-name" content="Peter Art" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="theme-color" content="#f97316" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Force light theme on initial load
                if (typeof window !== 'undefined') {
                  const savedTheme = localStorage.getItem('theme');
                  if (!savedTheme || savedTheme === 'dark') {
                    localStorage.setItem('theme', 'light');
                  }
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[var(--page-bg)] text-[var(--text-primary)] antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
        <PWAInstallButton />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#0b0f1c',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '28px',
              padding: '16px 18px',
            },
            success: {
              iconTheme: {
                primary: '#f97316',
                secondary: '#0b0f1c',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff6b00',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}

