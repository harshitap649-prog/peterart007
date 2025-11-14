'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllArtworks, searchArtworks } from '@/lib/artworks'
import { getUserOrders, createOrder } from '@/lib/orders'
import { getUserWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist'
import { addComment, likeArtwork, isLiked } from '@/lib/comments'
import { logout } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiSearch, FiHeart, FiShoppingCart, FiShare2, FiMessageCircle, FiThumbsUp, FiHelpCircle, FiMenu, FiX, FiSettings, FiLogOut, FiUser } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import HelpSupport from './HelpSupport'
import LoginModal from './LoginModal'
import { getCurrentUser } from '@/lib/auth'

interface UserDashboardProps {
  user: any
  onUserUpdate?: (user: any) => void
}

export default function UserDashboard({ user, onUserUpdate }: UserDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [artworks, setArtworks] = useState<any[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('artworks')
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['artworks', 'wishlist', 'orders', 'support'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    if (searchTerm) {
      const filtered = artworks.filter((artwork: any) =>
        artwork.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredArtworks(filtered)
    } else {
      setFilteredArtworks(artworks)
    }
  }, [searchTerm, artworks])

  const loadData = async () => {
    setLoading(true)
    try {
      const arts = await getAllArtworks()
      setArtworks(arts)
      setFilteredArtworks(arts)
      
      if (user) {
        const ords = await getUserOrders(user.uid)
        setOrders(ords)
        
        const wish = await getUserWishlist(user.uid)
        setWishlist(wish)
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleWishlist = async (artworkId: string) => {
    // Check if user is logged in - if not, show login modal
    if (!user || !user.uid) {
      setLoginModalOpen(true)
      toast.error('Please sign in to add items to wishlist')
      return
    }
    
    try {
      const inWishlist = await isInWishlist(user.uid, artworkId)
      if (inWishlist) {
        await removeFromWishlist(user.uid, artworkId)
        setWishlist(wishlist.filter(id => id !== artworkId))
        toast.success('Removed from wishlist')
      } else {
        await addToWishlist(user.uid, artworkId)
        setWishlist([...wishlist, artworkId])
        toast.success('Added to wishlist')
      }
      const updatedWishlist = await getUserWishlist(user.uid)
      setWishlist(updatedWishlist)
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('Failed to update wishlist')
    }
  }

  const handleLike = async (artworkId: string) => {
    // Check if user is logged in - if not, show login modal
    if (!user || !user.uid) {
      setLoginModalOpen(true)
      toast.error('Please sign in to like artworks')
      return
    }
    
    try {
      await likeArtwork(artworkId, user.uid)
      loadData()
    } catch (error) {
      toast.error('Failed to like artwork')
    }
  }

  const handleComment = async (artworkId: string) => {
    if (!user || !commentText.trim()) return
    
    try {
      await addComment(artworkId, {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        text: commentText
      })
      toast.success('Comment added')
      setCommentText('')
      loadData()
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const handleShare = async (artwork: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork.title,
          text: artwork.description,
          url: window.location.href
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      if (onUserUpdate) {
        onUserUpdate(null)
      }
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Logout failed')
    }
  }

  const confirmLogout = async () => {
    setShowLogoutConfirm(false)
    await handleLogout()
  }

  const handleNavClick = (tab: string) => {
    if (tab === 'wishlist' || tab === 'orders' || tab === 'support') {
      // Check if user is logged in - if not, show login modal
      if (!user || !user.uid) {
        setSidebarOpen(false)
        setLoginModalOpen(true)
        toast.error('Please sign in to access this section')
        return
      }
    }
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const handleLoginSuccess = async (loggedInUser: any) => {
    if (onUserUpdate) {
      onUserUpdate(loggedInUser)
    }
    // Reload data after login
    await loadData()
  }

  const handleBuyClick = (artworkId: string) => {
    // Check if user is logged in - if not, show login modal
    if (!user || !user.uid) {
      setLoginModalOpen(true)
      toast.error('Please sign in to purchase artworks')
      return
    }
    router.push(`/artwork/${artworkId}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* Hamburger Menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Center - Peter Art */}
        <h1 className="text-lg font-bold text-gray-900">Peter Art</h1>

        {/* User Icon / Settings */}
        <div className="relative">
          {user ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiUser className="text-xl" />
              </button>

              {/* User Menu Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.displayName || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          toast('Language settings coming soon', { icon: 'ℹ️' })
                          setUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Change Language
                      </button>
                      <button
                        onClick={() => {
                          toast('Theme settings coming soon', { icon: 'ℹ️' })
                          setUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </button>
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true)
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiUser className="text-xl" />
            </button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <nav className="py-4">
              <button
                onClick={() => handleNavClick('artworks')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'artworks'
                    ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Artworks
              </button>
              <button
                onClick={() => handleNavClick('wishlist')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'wishlist'
                    ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Wishlist
              </button>
              <button
                onClick={() => handleNavClick('orders')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => handleNavClick('support')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'support'
                    ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Help & Support
              </button>
              {user && (
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true)
                    setSidebarOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <FiLogOut className="text-base" />
                  Logout
                </button>
              )}
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="px-2 py-2">
        {/* Logo Image - Only show on artworks tab */}
        {activeTab === 'artworks' && (
          <div className="text-center mb-2">
            <div className="relative w-24 h-24 mx-auto mb-1 overflow-hidden" style={{ borderRadius: '0 0 50% 50%' }}>
              <img
                src="https://png.pngtree.com/png-vector/20240618/ourmid/pngtree-a-cute-girl-dancing-colorful-art-design-png-image_12793513.png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-0.5">Fall in love with art</h1>
            <p className="text-gray-600 text-xs">Turn Empty Walls into Expressions</p>
          </div>
        )}

        {/* Search Bar - Only show on artworks tab */}
        {activeTab === 'artworks' && (
          <div className="mb-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search artworks..."
                className="input-field pr-9 text-sm py-2"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900 text-sm" />
            </div>
          </div>
        )}

        {/* Artworks Tab */}
        {activeTab === 'artworks' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm">Loading artworks...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {filteredArtworks.map((artwork: any) => (
                  <div key={artwork.id} className="card p-1.5">
                    {artwork.images && artwork.images[0] ? (
                      <div className="relative w-full h-28 mb-1 rounded overflow-hidden">
                        <img
                          src={artwork.images[0]}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-28 mb-1 rounded bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-xs mb-0.5 line-clamp-1">{artwork.title}</h3>
                    <p className="text-gray-600 text-xs mb-1 line-clamp-2">{artwork.description}</p>
                    <p className="text-gray-900 font-bold text-xs mb-1">₹{artwork.price}</p>
                    
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-center gap-0.5 text-gray-400">
                        <FiThumbsUp className={`text-xs ${artwork.likedBy?.includes(user?.uid) ? 'text-gray-900' : ''}`} />
                        <span className="text-xs">{artwork.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-gray-400">
                        <FiMessageCircle className="text-xs" />
                        <span className="text-xs">{artwork.comments?.length || 0}</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleWishlist(artwork.id)}
                        className={`flex-1 flex items-center justify-center gap-0.5 btn-secondary text-xs py-1.5 ${
                          wishlist.includes(artwork.id) ? 'text-red-400' : ''
                        }`}
                      >
                        {wishlist.includes(artwork.id) ? <FaHeart className="text-xs" /> : <FiHeart className="text-xs" />}
                      </button>
                      <button
                        onClick={() => handleBuyClick(artwork.id)}
                        className="flex-1 btn-primary text-xs py-1.5"
                      >
                        Buy
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <FiHeart className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {artworks
                  .filter((artwork: any) => wishlist.includes(artwork.id))
                  .map((artwork: any) => (
                    <div key={artwork.id} className="card p-1.5">
                      {artwork.images && artwork.images[0] ? (
                        <div className="relative w-full h-28 mb-1 rounded overflow-hidden">
                          <img
                            src={artwork.images[0]}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-28 mb-1 rounded bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                      <h3 className="font-semibold text-xs mb-0.5 line-clamp-1">{artwork.title}</h3>
                      <p className="text-gray-600 text-xs mb-1 line-clamp-2">{artwork.description}</p>
                      <p className="text-gray-900 font-bold text-xs mb-1">₹{artwork.price}</p>
                      <button
                        onClick={() => handleBuyClick(artwork.id)}
                        className="btn-primary w-full text-xs py-1.5"
                      >
                        Buy Now
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <FiShoppingCart className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">You have no orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div key={order.id} className="card p-3">
                    <div className="flex gap-3">
                      {order.artworkImage && (
                        <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={order.artworkImage}
                            alt={order.artworkTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{order.artworkTitle}</h3>
                        <p className="text-gray-600 text-xs mb-1">
                          Qty: {order.quantity || 1} × ₹{order.unitPrice || order.total}
                        </p>
                        <p className="text-gray-900 font-bold text-sm mb-1">₹{order.total}</p>
                        <p className="text-gray-500 text-xs">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Help & Support Tab */}
        {activeTab === 'support' && (
          <div>
            <HelpSupport user={user} />
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card p-4 md:p-6 max-w-md w-full bg-white">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">Confirm Logout</h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Are you sure you want to logout?</p>
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={confirmLogout}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm md:text-base font-medium rounded-lg transition-all bg-gray-900 text-white hover:bg-gray-800"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-secondary flex-1 text-sm md:text-base py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
