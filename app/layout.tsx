import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import BannerAd from '@/components/BannerAd'
import { CartProvider } from '@/contexts/CartContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

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
      <body>
        <ThemeProvider>
          <CartProvider>
            {children}
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

