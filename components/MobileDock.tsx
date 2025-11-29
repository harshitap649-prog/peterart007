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
    color: 'blue' 
  },
  { 
    href: '/messages', 
    label: 'Chat', 
    icon: FiMessageCircle, 
    iconActive: FaComments,
    color: 'green' 
  },
  { 
    href: '/user?tab=orders', 
    label: 'Orders', 
    icon: FiShoppingBag, 
    iconActive: FaShoppingBag,
    color: 'orange' 
  },
  { 
    href: '/user?tab=profile', 
    label: 'Profile', 
    icon: FiUser, 
    iconActive: FaUser,
    color: 'pink' 
  }
]

const colorMap: Record<string, { active: string; inactive: string; bg: string }> = {
  blue: {
    active: 'from-blue-500 to-blue-600',
    inactive: 'text-blue-600',
    bg: 'bg-blue-50'
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
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:hidden safe-area-bottom">
      <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between gap-0.5 rounded-2xl border border-gray-200/60 bg-white/95 px-1.5 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        {dockLinks.map((item) => {
          const Icon = item.icon
          const IconActive = item.iconActive || item.icon
          const active = isActive(item.href)
          const colors = colorMap[item.color] || colorMap.blue
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1.5 py-1.5 transition-all duration-200 active:scale-95 touch-manipulation ${
                active
                  ? `bg-gradient-to-br ${colors.active} text-white shadow-sm`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {/* Active indicator dot */}
              {active && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-sm"></div>
              )}
              
              <span
                className={`relative flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? 'text-white'
                    : `${colors.inactive} group-hover:scale-105`
                }`}
              >
                {active ? (
                  <IconActive 
                    className="relative z-10" 
                    style={{ 
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
                      strokeWidth: 0
                    }}
                  />
                ) : (
                  <Icon 
                    className="relative z-10" 
                    style={{ 
                      filter: 'drop-shadow(0 0.5px 1px rgba(0,0,0,0.08))',
                      strokeWidth: 2
                    }}
                  />
                )}
              </span>
              
              <span className={`leading-tight transition-colors text-[9px] font-medium ${active ? 'text-white' : 'text-gray-500'}`}>
                {item.label}
              </span>
              
              {/* Hover effect overlay */}
              {!active && (
                <span className="absolute inset-0 rounded-xl bg-gray-100/0 group-hover:bg-gray-100/30 transition-all duration-200"></span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

