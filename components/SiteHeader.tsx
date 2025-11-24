'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiMenu,
  FiX,
  FiPhoneCall,
  FiMessageCircle,
  FiArrowUpRight,
  FiCompass
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
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-6 md:pt-6">
      <div className="glass-panel relative mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-[28px] border border-black/10 px-4 py-4 shadow-lift md:flex-row md:items-center md:gap-6 md:px-6 md:py-5">
        <div className="flex w-full items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-xl font-semibold text-white shadow-lg shadow-orange-500/30">
              PA
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">Peter Art</p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                Collect • Commission • Connect
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Cart />
            <Link
              href="/user"
              className="hidden rounded-full border border-black/15 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-black/25 hover:bg-black/5 md:inline-flex"
            >
              Dashboard
            </Link>
            <button
              className="rounded-2xl border border-black/10 p-2 text-[var(--text-primary)] transition hover:bg-black/5 lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-1 md:flex-row md:items-center md:justify-between">
          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-pill ${isActive(link.href) ? 'active' : ''} ${
                  link.highlight && !isActive(link.href)
                    ? 'border-black/20 text-[var(--text-primary)]'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="tel:+919876543210"
              className="chip text-xs uppercase tracking-wide text-[var(--text-secondary)]"
            >
              <FiPhoneCall className="text-base" />
              Call concierge
            </a>
            <Link
              href="/user?tab=artworks"
              className="btn-primary flex-1 justify-center text-sm md:flex-none"
            >
              <FiCompass />
              Start collecting
            </Link>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden">
            <div className="mt-2 grid gap-3 rounded-3xl border border-black/10 bg-white/95 p-3 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3 text-sm font-semibold ${
                    isActive(link.href)
                      ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white'
                      : 'text-[var(--text-primary)] hover:border-black/15 hover:bg-black/5'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                  <FiArrowUpRight />
                </Link>
              ))}
            </div>
            <div className="mt-3 rounded-3xl border border-black/10 bg-white/90 p-4 text-sm text-[var(--text-primary)] shadow-lg">
              <p className="mb-1 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <FiMessageCircle />
                Live art concierge
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Chat with our team for curation advice, order support, or commission guidance.
              </p>
              <Link
                href="/user?tab=support"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md"
                onClick={() => setMobileOpen(false)}
              >
                Open support
                <FiArrowUpRight className="text-base" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

