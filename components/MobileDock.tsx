'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { FiHome, FiMessageCircle, FiShoppingBag, FiUser } from 'react-icons/fi'
import { FaHome, FaComments, FaShoppingBag, FaUser } from 'react-icons/fa'

const dockLinks = [
  { 
    href: '/', 
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
    label: 'My Orders', 
    icon: FiShoppingBag, 
    iconActive: FaShoppingBag,
    color: 'orange' 
  },
  { 
    href: '/user', 
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
      return pathname === '/user' && (!tab || tab === 'artworks')
    }
    if (href === '/messages') {
      return pathname === '/messages' || pathname.startsWith('/chat/')
    }
    return pathname === href
  }

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden safe-area-bottom">
      <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-1 rounded-[28px] border border-gray-200/80 bg-white/98 px-2 py-2.5 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
        {dockLinks.map((item) => {
          const Icon = item.icon
          const IconActive = item.iconActive || item.icon
          const active = isActive(item.href)
          const colors = colorMap[item.color] || colorMap.blue
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-all duration-300 active:scale-95 touch-manipulation ${
                active
                  ? `bg-gradient-to-br ${colors.active} text-white shadow-lg`
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {/* Active indicator dot */}
              {active && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-md"></div>
              )}
              
              <span
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl text-lg transition-all duration-300 ${
                  active
                    ? 'bg-white/25 text-white shadow-inner'
                    : `${colors.bg} ${colors.inactive} group-hover:scale-110 group-hover:shadow-md`
                }`}
              >
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
                    className="relative z-10" 
                    style={{ 
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                      strokeWidth: 2
                    }}
                  />
                )}
                
                {/* Subtle glow effect for active state */}
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-white/20 blur-sm"></span>
                )}
              </span>
              
              <span className={`leading-tight transition-colors text-[10px] font-bold ${active ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
              </span>
              
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

