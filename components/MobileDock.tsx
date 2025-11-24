'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiGrid, FiMessageCircle, FiShoppingCart, FiUser } from 'react-icons/fi'
import { useCart } from '@/contexts/CartContext'

const dockLinks = [
  { href: '/', label: 'Home', icon: FiHome, color: 'blue' },
  { href: '/user?tab=artworks', label: 'Browse', icon: FiGrid, color: 'purple' },
  { href: '/messages', label: 'Chat', icon: FiMessageCircle, color: 'green' },
  { href: '/cart', label: 'Cart', icon: FiShoppingCart, color: 'orange' },
  { href: '/user', label: 'Profile', icon: FiUser, color: 'pink' }
]

const colorMap: Record<string, { active: string; inactive: string; bg: string }> = {
  blue: {
    active: 'from-blue-500 to-blue-600',
    inactive: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  purple: {
    active: 'from-purple-500 to-purple-600',
    inactive: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  green: {
    active: 'from-green-500 to-green-600',
    inactive: 'text-green-600',
    bg: 'bg-green-50'
  },
  orange: {
    active: 'from-orange-500 to-orange-600',
    inactive: 'text-orange-600',
    bg: 'bg-orange-50'
  },
  pink: {
    active: 'from-pink-500 to-pink-600',
    inactive: 'text-pink-600',
    bg: 'bg-pink-50'
  }
}

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
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden safe-area-bottom">
      <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-0.5 rounded-[28px] border border-gray-200/80 bg-white/98 px-1.5 py-2 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
        {dockLinks.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const colors = colorMap[item.color] || colorMap.blue
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1.5 py-1.5 text-[10px] font-semibold transition-all duration-200 active:scale-95 ${
                active
                  ? `bg-gradient-to-br ${colors.active} text-white`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {/* Active indicator dot */}
              {active && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/90 shadow-sm"></div>
              )}
              
              <span
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all duration-200 ${
                  active
                    ? 'bg-white/20 text-white shadow-sm'
                    : `${colors.bg} ${colors.inactive} group-hover:scale-110`
                }`}
              >
                <Icon className="relative z-10" />
                
                {/* Subtle glow effect for active state */}
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-white/10 blur-sm"></span>
                )}
              </span>
              
              <span className={`leading-tight transition-colors ${active ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
              </span>
              
              {/* Enhanced cart badge */}
              {item.label === 'Cart' && cartItemCount > 0 && (
                <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg ${
                  active
                    ? 'bg-white/30 backdrop-blur-sm border border-white/40'
                    : 'bg-gradient-to-br from-orange-500 to-red-500 border-2 border-white'
                }`}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
              
              {/* Hover effect overlay */}
              {!active && (
                <span className="absolute inset-0 rounded-2xl bg-gray-100/0 group-hover:bg-gray-100/50 transition-all duration-200"></span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

