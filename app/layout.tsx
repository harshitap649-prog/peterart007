import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

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
    <html lang="en">
      <body>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255, 0, 255, 0.3)',
            },
            success: {
              iconTheme: {
                primary: '#ff00ff',
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
      </body>
    </html>
  )
}

