'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { FiHome, FiMessageCircle, FiShoppingBag, FiUser } from 'react-icons/fi'
import { FaHome, FaComments, FaShoppingBag, FaUser } from 'react-icons/fa'

const dockLinks = [
  { 
    href: '/user?tab=artworks', 
    label: 'Home', 
    icon: FiHome, 
    iconActive: FaHome,
    color: 'orange-light' 
  },
  { 
    href: '/messages', 
    label: 'Chat', 
    icon: FiMessageCircle, 
    iconActive: FaComments,
    color: 'orange-medium' 
  },
  { 
    href: '/user?tab=orders', 
    label: 'Orders', 
    icon: FiShoppingBag, 
    iconActive: FaShoppingBag,
    color: 'orange-dark' 
  },
  { 
    href: '/user?tab=profile', 
    label: 'Profile', 
    icon: FiUser, 
    iconActive: FaUser,
    color: 'orange-accent' 
  }
]

const colorMap: Record<string, { active: string; inactive: string; bg: string; shadow: string }> = {
  'orange-light': {
    active: 'from-orange-400 via-orange-500 to-orange-600',
    inactive: 'text-orange-500',
    bg: 'bg-orange-50',
    shadow: 'shadow-orange-500/30'
  },
  'orange-medium': {
    active: 'from-orange-500 via-orange-600 to-amber-600',
    inactive: 'text-orange-600',
    bg: 'bg-orange-100',
    shadow: 'shadow-orange-600/40'
  },
  'orange-dark': {
    active: 'from-orange-600 via-amber-600 to-orange-700',
    inactive: 'text-orange-700',
    bg: 'bg-orange-100',
    shadow: 'shadow-orange-700/50'
  },
  'orange-accent': {
    active: 'from-amber-500 via-orange-600 to-orange-700',
    inactive: 'text-amber-600',
    bg: 'bg-amber-50',
    shadow: 'shadow-amber-600/40'
  }
}

export default function MobileDock() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href.startsWith('/user')) {
      const tab = searchParams?.get('tab')
      if (href.includes('tab=orders')) {
        return pathname === '/user' && tab === 'orders'
      }
      if (href.includes('tab=profile')) {
        return pathname === '/user' && tab === 'profile'
      }
      if (href.includes('tab=artworks')) {
        return pathname === '/user' && (!tab || tab === 'artworks')
      }
      return pathname === '/user' && (!tab || tab === 'artworks')
    }
    if (href === '/messages') {
      return pathname === '/messages' || pathname.startsWith('/chat/')
    }
    return pathname === href
  }

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden safe-area-bottom">
      <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between gap-1 rounded-3xl border border-orange-200/50 bg-gradient-to-b from-white via-orange-50/30 to-white/95 px-2 py-2.5 shadow-[0_-8px_30px_rgba(249,115,22,0.15)] backdrop-blur-xl">
        {dockLinks.map((item) => {
          const Icon = item.icon
          const IconActive = item.iconActive || item.icon
          const active = isActive(item.href)
          const colors = colorMap[item.color] || colorMap['orange-medium']
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all duration-300 active:scale-90 touch-manipulation ${
                active
                  ? `bg-gradient-to-br ${colors.active} text-white shadow-lg ${colors.shadow}`
                  : `${colors.inactive} hover:bg-orange-50/50`
              }`}
            >
              {/* Active indicator - animated top dot */}
              {active && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-md animate-pulse"></div>
              )}
              
              {/* Icon container with enhanced styling */}
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl text-base transition-all duration-300 ${
                  active
                    ? 'text-white scale-110'
                    : `${colors.inactive} group-hover:scale-110`
                }`}
              >
                {/* Glow effect for active state */}
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-white/20 blur-md"></span>
                )}
                
                {active ? (
                  <IconActive 
                    className="relative z-10" 
                    style={{ 
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                      strokeWidth: 0
                    }}
                  />
                ) : (
                  <Icon 
                    className="relative z-10 transition-all duration-300" 
                    style={{ 
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                      strokeWidth: 2.5
                    }}
                  />
                )}
              </span>
              
              {/* Label with enhanced typography */}
              <span className={`leading-tight transition-all duration-300 text-[10px] font-semibold tracking-wide ${
                active 
                  ? 'text-white drop-shadow-sm' 
                  : `${colors.inactive} group-hover:font-bold`
              }`}>
                {item.label}
              </span>
              
              {/* Hover effect overlay with orange tint */}
              {!active && (
                <span className={`absolute inset-0 rounded-2xl ${colors.bg} opacity-0 group-hover:opacity-40 transition-all duration-300`}></span>
              )}
              
              {/* Ripple effect on active */}
              {active && (
                <span className="absolute inset-0 rounded-2xl bg-white/10 animate-ping opacity-75"></span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

