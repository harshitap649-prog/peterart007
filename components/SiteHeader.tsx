'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiMenu,
  FiX,
  FiPhoneCall,
  FiMessageCircle,
  FiChevronRight,
  FiArrowUpRight
} from 'react-icons/fi'
import Cart from './Cart'

const navLinks = [
  { href: '/user?tab=artworks', label: 'Discover' },
  { href: '/user?tab=wishlist', label: 'Wishlist' },
  { href: '/user?tab=orders', label: 'Orders' },
  { href: '/messages', label: 'Messages' },
  { href: '/artist/apply', label: 'Become an Artist', highlight: true }
]

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href.startsWith('/user')) {
      return pathname === '/user' || pathname.startsWith('/user/')
    }
    return pathname === href
  }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100/60 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white font-bold flex items-center justify-center shadow-lg shadow-orange-500/30">
            PA
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 leading-tight">Peter Art</p>
            <p className="text-xs text-gray-500 hidden sm:block">Collect • Commission • Connect</p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                link.highlight
                  ? 'bg-gray-900 text-white hover:bg-black'
                  : isActive(link.href)
                    ? 'bg-orange-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="hidden rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 sm:flex sm:flex-col sm:items-start sm:gap-0"
            onClick={() => (window.location.href = 'tel:+919876543210')}
          >
            <span className="text-[10px] uppercase tracking-wide text-gray-400">Need help?</span>
            <span className="flex items-center gap-1 text-sm">
              <FiPhoneCall />
              +91 98765 43210
            </span>
          </button>
          <Cart />
          <Link
            href="/user"
            className="hidden rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 md:block"
          >
            Dashboard
          </Link>
          <button
            className="rounded-full border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-100 lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  link.highlight
                    ? 'bg-gray-900 text-white'
                    : isActive(link.href)
                      ? 'bg-orange-50 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
                <FiChevronRight className="text-base" />
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 px-4 py-4 text-sm text-gray-600">
            <p className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
              <FiMessageCircle />
              Live support
            </p>
            <p className="text-xs text-gray-500">
              Chat with us anytime from your dashboard or drop a message via the Help & Support tab.
            </p>
            <Link
              href="/user?tab=support"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30"
              onClick={() => setMobileOpen(false)}
            >
              Open support
              <FiArrowUpRight className="text-base" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

