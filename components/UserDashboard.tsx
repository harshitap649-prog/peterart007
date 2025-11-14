'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllArtworks, searchArtworks } from '@/lib/artworks'
import { getUserOrders, createOrder } from '@/lib/orders'
import { getUserWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist'
import { addComment, likeArtwork, isLiked } from '@/lib/comments'
import { logout } from '@/lib/auth'
import { loadPopunderAd, resetPopunderAd } from '@/lib/popunderAd'
import toast from 'react-hot-toast'
import { FiSearch, FiHeart, FiShoppingCart, FiShare2, FiMessageCircle, FiThumbsUp, FiHelpCircle, FiMenu, FiX, FiSettings, FiLogOut, FiUser, FiStar } from 'react-icons/fi'
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
  const [myReviews, setMyReviews] = useState<any[]>([])
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
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  // Translations
  const translations = {
    en: {
      changeLanguage: 'Change Language',
      english: 'English',
      hindi: 'Hindi',
      peterArt: 'Peter Art',
      fallInLove: 'Fall in love with art',
      turnEmptyWalls: 'Turn Empty Walls into Expressions',
      searchArtworks: 'Search artworks...',
      menu: 'Menu',
      artworks: 'Artworks',
      wishlist: 'Wishlist',
      myOrders: 'My Orders',
      myReviews: 'My Reviews',
      helpSupport: 'Help & Support',
      buy: 'Buy',
      buyNow: 'Buy Now',
      loading: 'Loading...',
      loadingArtworks: 'Loading artworks...',
      wishlistEmpty: 'Your wishlist is empty',
      noOrders: 'You have no orders yet',
      noReviews: 'You have not submitted any reviews yet',
      noImage: 'No image',
      imageNotFound: 'Image not found',
      pleaseSignIn: 'Please sign in to',
      addToWishlist: 'add items to wishlist',
      likeArtworks: 'like artworks',
      purchaseArtworks: 'purchase artworks',
      accessSection: 'access this section',
      removedFromWishlist: 'Removed from wishlist',
      addedToWishlist: 'Added to wishlist',
      commentAdded: 'Comment added',
      linkCopied: 'Link copied to clipboard!',
      failedToLoad: 'Failed to load data',
      failedToUpdate: 'Failed to update wishlist',
      failedToLike: 'Failed to like artwork',
      failedToComment: 'Failed to add comment',
    },
    hi: {
      changeLanguage: 'भाषा बदलें',
      english: 'अंग्रेजी',
      hindi: 'हिंदी',
      peterArt: 'पीटर आर्ट',
      fallInLove: 'कला से प्यार करें',
      turnEmptyWalls: 'खाली दीवारों को अभिव्यक्ति में बदलें',
      searchArtworks: 'कलाकृतियां खोजें...',
      menu: 'मेनू',
      artworks: 'कलाकृतियां',
      wishlist: 'इच्छा सूची',
      myOrders: 'मेरे ऑर्डर',
      myReviews: 'मेरी समीक्षाएं',
      helpSupport: 'सहायता और समर्थन',
      buy: 'खरीदें',
      buyNow: 'अभी खरीदें',
      loading: 'लोड हो रहा है...',
      loadingArtworks: 'कलाकृतियां लोड हो रही हैं...',
      wishlistEmpty: 'आपकी इच्छा सूची खाली है',
      noOrders: 'आपके पास अभी कोई ऑर्डर नहीं है',
      noReviews: 'आपने अभी तक कोई समीक्षा नहीं दी है',
      noImage: 'कोई छवि नहीं',
      imageNotFound: 'छवि नहीं मिली',
      pleaseSignIn: 'कृपया साइन इन करें',
      addToWishlist: 'इच्छा सूची में आइटम जोड़ने के लिए',
      likeArtworks: 'कलाकृतियों को पसंद करने के लिए',
      purchaseArtworks: 'कलाकृतियां खरीदने के लिए',
      accessSection: 'इस अनुभाग तक पहुंचने के लिए',
      removedFromWishlist: 'इच्छा सूची से हटा दिया गया',
      addedToWishlist: 'इच्छा सूची में जोड़ा गया',
      commentAdded: 'टिप्पणी जोड़ी गई',
      linkCopied: 'लिंक क्लिपबोर्ड पर कॉपी किया गया!',
      failedToLoad: 'डेटा लोड करने में विफल',
      failedToUpdate: 'इच्छा सूची अपडेट करने में विफल',
      failedToLike: 'कलाकृति को पसंद करने में विफल',
      failedToComment: 'टिप्पणी जोड़ने में विफल',
    },
  }

  const t = translations[language]

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | null
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when changed
  const changeLanguage = (lang: 'en' | 'hi') => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    setShowLanguageMenu(false)
    setUserMenuOpen(false)
    toast.success(lang === 'en' ? 'Language changed to English' : 'भाषा हिंदी में बदली गई')
  }

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['artworks', 'wishlist', 'orders', 'reviews', 'support'].includes(tab)) {
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
        
        // Load user's reviews
        const reviews: any[] = []
        arts.forEach((artwork: any) => {
          if (artwork.comments) {
            artwork.comments.forEach((comment: any) => {
              if (comment.userId === user.uid && (comment.rating || comment.text)) {
                reviews.push({
                  ...comment,
                  artworkId: artwork.id,
                  artworkTitle: artwork.title,
                  artworkImage: artwork.images?.[0]
                })
              }
            })
          }
        })
        setMyReviews(reviews)
      }
    } catch (error) {
      toast.error(t.failedToLoad)
    } finally {
      setLoading(false)
    }
  }

  const handleWishlist = async (artworkId: string) => {
    // Check if user is logged in - if not, show login modal
    if (!user || !user.uid) {
      setLoginModalOpen(true)
      toast.error(`${t.pleaseSignIn} ${t.addToWishlist}`)
      return
    }
    
    try {
      const inWishlist = await isInWishlist(user.uid, artworkId)
      if (inWishlist) {
        await removeFromWishlist(user.uid, artworkId)
        setWishlist(wishlist.filter(id => id !== artworkId))
        toast.success(t.removedFromWishlist)
      } else {
        await addToWishlist(user.uid, artworkId)
        setWishlist([...wishlist, artworkId])
        toast.success(t.addedToWishlist)
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
      toast.error(`${t.pleaseSignIn} ${t.likeArtworks}`)
      return
    }
    
    try {
      await likeArtwork(artworkId, user.uid)
      loadData()
    } catch (error) {
      toast.error(t.failedToLike)
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
      toast.success(t.commentAdded)
      setCommentText('')
      loadData()
    } catch (error) {
      toast.error(t.failedToComment)
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
      toast.success(t.linkCopied)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      // Reset popunder flag on logout so it can trigger again in new session
      resetPopunderAd()
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
    // Load popunder ad before logout (only triggers once per session)
    loadPopunderAd('logout')
    await handleLogout()
  }

  const handleNavClick = (tab: string) => {
    if (tab === 'wishlist' || tab === 'orders' || tab === 'reviews' || tab === 'support') {
      // Check if user is logged in - if not, show login modal
      if (!user || !user.uid) {
        setSidebarOpen(false)
        setLoginModalOpen(true)
        toast.error(`${t.pleaseSignIn} ${t.accessSection}`)
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
      toast.error(`${t.pleaseSignIn} ${t.purchaseArtworks}`)
      return
    }
    router.push(`/artwork/${artworkId}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-2 py-2 flex items-center justify-between relative">
        {/* Hamburger Menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Center - Peter Art */}
        <h1 className="text-lg font-bold text-gray-900">{t.peterArt}</h1>

        {/* User Icon / Settings */}
        <div className="relative z-[60]">
          {user ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative z-[61]"
              >
                <FiUser className="text-xl" />
              </button>

              {/* User Menu Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[55]"
                    onClick={() => {
                      setUserMenuOpen(false)
                      setShowLanguageMenu(false)
                    }}
                  ></div>
                  <div className="fixed right-2 top-16 md:right-4 md:top-20 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] pointer-events-auto">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200 pointer-events-auto">
                        <p className="text-sm font-medium text-gray-900">{user.displayName || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="relative pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowLanguageMenu(!showLanguageMenu)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                        >
                          <span>{t.changeLanguage}</span>
                          <span className="text-xs">{language === 'en' ? 'EN' : 'HI'}</span>
                        </button>
                        {showLanguageMenu && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[101]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                changeLanguage('en')
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                                language === 'en' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {t.english}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                changeLanguage('hi')
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                                language === 'hi' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {t.hindi}
                            </button>
                          </div>
                        )}
                      </div>
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
              <h2 className="text-lg font-bold text-gray-900">{t.menu}</h2>
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
                {t.artworks}
              </button>
              <button
                onClick={() => handleNavClick('wishlist')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'wishlist'
                    ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.wishlist}
              </button>
              <button
                onClick={() => handleNavClick('orders')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.myOrders}
              </button>
              <button
                onClick={() => handleNavClick('reviews')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.myReviews}
              </button>
              <button
                onClick={() => handleNavClick('support')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'support'
                    ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.helpSupport}
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
      <div>
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
            <h1 className="text-lg font-bold text-gray-900 mb-0.5">{t.fallInLove}</h1>
            <p className="text-gray-600 text-xs">{t.turnEmptyWalls}</p>
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
                placeholder={t.searchArtworks}
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
                <p className="text-gray-400 text-sm">{t.loadingArtworks}</p>
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
                        <span className="text-gray-400 text-xs">{t.noImage}</span>
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
                        {t.buy}
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
                <p className="text-gray-600 text-sm">{t.wishlistEmpty}</p>
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
                        <span className="text-gray-400 text-xs">{t.noImage}</span>
                      </div>
                    )}
                      <h3 className="font-semibold text-xs mb-0.5 line-clamp-1">{artwork.title}</h3>
                      <p className="text-gray-600 text-xs mb-1 line-clamp-2">{artwork.description}</p>
                      <p className="text-gray-900 font-bold text-xs mb-1">₹{artwork.price}</p>
                      <button
                        onClick={() => handleBuyClick(artwork.id)}
                        className="btn-primary w-full text-xs py-1.5"
                      >
                        {t.buyNow}
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
                <p className="text-gray-600 text-sm">{t.noOrders}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {orders.map((order: any) => (
                  <div 
                    key={order.id} 
                    className="card p-1.5 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => order.artworkId && router.push(`/artwork/${order.artworkId}`)}
                  >
                    {order.artworkImage ? (
                      <div className="relative w-full h-28 mb-1 rounded overflow-hidden">
                        <img
                          src={order.artworkImage}
                          alt={order.artworkTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-28 mb-1 rounded bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">{t.noImage}</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-xs mb-0.5 line-clamp-1">{order.artworkTitle}</h3>
                    <p className="text-gray-600 text-xs mb-0.5">
                      Qty: {order.quantity || 1} × ₹{order.unitPrice || order.total}
                    </p>
                    <p className="text-gray-900 font-bold text-xs mb-1">₹{order.total}</p>
                    <p className={`text-xs px-1.5 py-0.5 rounded inline-block ${
                      order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : order.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {myReviews.length === 0 ? (
              <div className="text-center py-12">
                <FiMessageCircle className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">{t.noReviews}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myReviews.map((review: any) => (
                  <div key={review.id} className="card p-3">
                    <div className="flex gap-3">
                      {review.artworkImage && (
                        <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={review.artworkImage}
                            alt={review.artworkTitle}
                            className="w-full h-full object-cover"
                            onClick={() => router.push(`/artwork/${review.artworkId}`)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold text-sm mb-1 line-clamp-1 cursor-pointer hover:text-gray-600"
                          onClick={() => router.push(`/artwork/${review.artworkId}`)}
                        >
                          {review.artworkTitle}
                        </h3>
                        {review.rating && (
                          <div className="flex items-center gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                className={`text-xs ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {review.text && (
                          <p className="text-gray-600 text-xs mb-2 line-clamp-2">{review.text}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          <div className="flex items-center gap-1">
                            <FiThumbsUp className="text-xs" />
                            <span>{review.likes || 0} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiMessageCircle className="text-xs" />
                            <span>{review.replies?.length || 0} comments</span>
                          </div>
                        </div>
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-700 mb-1">Comments:</p>
                            {review.replies.slice(0, 2).map((reply: any) => (
                              <div key={reply.id} className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">{reply.userName}:</span> {reply.text}
                              </div>
                            ))}
                            {review.replies.length > 2 && (
                              <button
                                onClick={() => router.push(`/artwork/${review.artworkId}`)}
                                className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                              >
                                View all {review.replies.length} comments
                              </button>
                            )}
                          </div>
                        )}
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
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            padding: '1rem'
          }}
        >
          {/* Backdrop overlay to fade out background */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1
            }}
            onClick={() => setShowLogoutConfirm(false)}
          />
          
          {/* Modal content */}
          <div 
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative z-10"
            style={{ 
              border: 'none',
              margin: 'auto',
              transform: 'none'
            }}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-4">
              <button
                onClick={confirmLogout}
                className="btn-primary flex-1"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-secondary flex-1"
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
