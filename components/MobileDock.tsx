'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiGrid, FiMessageCircle, FiShoppingCart, FiUser } from 'react-icons/fi'
import { useCart } from '@/contexts/CartContext'

const dockLinks = [
  { href: '/', label: 'Home', icon: FiHome },
  { href: '/user?tab=artworks', label: 'Browse', icon: FiGrid },
  { href: '/messages', label: 'Chat', icon: FiMessageCircle },
  { href: '/cart', label: 'Cart', icon: FiShoppingCart },
  { href: '/user', label: 'Profile', icon: FiUser }
]

export default function MobileDock() {
  const pathname = usePathname()
  const { cartItemCount } = useCart()

  const isActive = (href: string) => {
    if (href.startsWith('/user')) {
      return pathname === '/user' || pathname.startsWith('/user/')
    }
    return pathname === href
  }

  return (
    <nav className="pointer-events-none fixed bottom-4 left-0 right-0 z-40 px-4 md:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-1 rounded-3xl border border-white/80 bg-white/95 px-3 py-2 shadow-[0_20px_60px_-30px_rgba(249,115,22,0.7)] backdrop-blur">
        {dockLinks.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-[11px] font-semibold transition ${
                active ? 'bg-orange-50 text-orange-600' : 'text-gray-500'
              }`}
            >
              <Icon className="text-base" />
              {item.label}
              {item.label === 'Cart' && cartItemCount > 0 && (
                <span className="absolute -top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

