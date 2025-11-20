import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import BannerAd from '@/components/BannerAd'
import { CartProvider } from '@/contexts/CartContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import MobileDock from '@/components/MobileDock'

export const metadata: Metadata = {
  title: 'Peter Art - Artwork Shop',
  description: 'Buy and sell beautiful artworks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
      <body className="bg-[#fefaf4] text-gray-900">
        <ThemeProvider>
          <CartProvider>
            <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#fff3eb] via-white to-white">
              <SiteHeader />
              <main className="flex-1 w-full">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <SiteFooter />
            </div>
            <MobileDock />
          </CartProvider>
        </ThemeProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255, 123, 163, 0.3)',
            },
            success: {
              iconTheme: {
                primary: '#FF7BA3',
                secondary: '#fff',
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
        
        {/* Banner Ad at Bottom */}
        <BannerAd />
      </body>
    </html>
  )
}

