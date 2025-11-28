import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/contexts/CartContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import MobileDock from '@/components/MobileDock'
import BannerAd from '@/components/BannerAd'
import ConditionalLayout from '@/components/ConditionalLayout'

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
      <body className="bg-[var(--page-bg)] text-[var(--text-primary)] antialiased">
        <ThemeProvider>
          <CartProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </CartProvider>
        </ThemeProvider>
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

