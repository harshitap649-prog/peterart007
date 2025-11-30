'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllArtworks, searchArtworks } from '@/lib/artworks'
import { getUserOrders, createOrder, cancelOrder, returnOrder } from '@/lib/orders'
import { getUserWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist'
import { addComment, likeArtwork, isLiked } from '@/lib/comments'
import { logout } from '@/lib/auth'
import { loadPopunderAd, resetPopunderAd } from '@/lib/popunderAd'
import toast from 'react-hot-toast'
import { FiSearch, FiHeart, FiShoppingCart, FiShare2, FiMessageCircle, FiThumbsUp, FiHelpCircle, FiMenu, FiX, FiSettings, FiLogOut, FiUser, FiStar, FiPackage, FiTrendingUp, FiCalendar, FiDollarSign, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { FaHeart, FaSearch, FaShoppingCart, FaUser, FaStar, FaBox, FaQuestionCircle, FaCog, FaDollarSign, FaChartLine, FaComments } from 'react-icons/fa'
import { HiSearch, HiHeart, HiShoppingCart, HiUser, HiStar, HiCube, HiQuestionMarkCircle, HiCog, HiCurrencyDollar, HiTrendingUp, HiChatAlt2 } from 'react-icons/hi'
import HelpSupport from './HelpSupport'
import LoginModal from './LoginModal'
import Cart from './Cart'
import SearchFilters from './SearchFilters'
import OrderTracking from './OrderTracking'
import UserProfile from './UserProfile'
import RecommendationSection from './RecommendationSection'
import GiftCardManagement from './GiftCardManagement'
import ArtistDashboard from './ArtistDashboard'
import ArtistBadge from './ArtistBadge'
import ArtistFeed from './ArtistFeed'
import FollowButton from './FollowButton'
import BannerAd from './BannerAd'
import { getCurrentUser } from '@/lib/auth'
import { getArtistByUserId, getArtistById } from '@/lib/artists'
import { getUserFollowing } from '@/lib/follows'

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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null)
  const [isArtist, setIsArtist] = useState(false)
  const [artistProfile, setArtistProfile] = useState<any>(null)
  const [previousArtistStatus, setPreviousArtistStatus] = useState<string | null>(null)
  const [showCongratulations, setShowCongratulations] = useState(false)
  const [followingArtists, setFollowingArtists] = useState<any[]>([])
  const [isMobileView, setIsMobileView] = useState(false)
  const [expandedArtistId, setExpandedArtistId] = useState<string | null>(null)
  const [artistArtworks, setArtistArtworks] = useState<Record<string, any[]>>({})
  const [loadingArtworks, setLoadingArtworks] = useState<Record<string, boolean>>({})

  // Translations
  const translations = {
    en: {
      changeLanguage: 'Change Language',
      english: 'English',
      hindi: 'Hindi',
      peterArt: 'Peter Art',
      fallInLove: 'Fall in love with art',
      turnEmptyWalls: 'Turn Empty Walls into Expressions',
      securePayment: 'Trusted payments & same-day order tracking',
      searchArtworks: 'Search artworks...',
      menu: 'Menu',
      artworks: 'Artworks',
      wishlist: 'Wishlist',
      myOrders: 'My Orders',
      myReviews: 'My Reviews',
      helpSupport: 'Help & Support',
      myProfile: 'My Profile',
      myGiftCards: 'My Gift Cards',
      artistDashboard: 'Artist Dashboard',
      buy: 'Buy',
      buyNow: 'Buy Now',
      loading: 'Loading...',
      loadingArtworks: 'Loading artworks...',
      wishlistEmpty: 'Your wishlist is empty',
      noOrders: 'You have no orders yet',
      orderConfirmed: 'Order Confirmed',
      cancelOrder: 'Cancel Order',
      cancelOrderConfirm: 'Are you sure you want to cancel this order?',
      orderCancelled: 'Order cancelled successfully',
      orderCancelFailed: 'Failed to cancel order',
      cancelTimeExpired: 'Order can only be cancelled within 1 hour of placement',
      noReviews: 'You have not submitted any reviews yet',
      noResultsFound: 'No results found for',
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
      quantity: 'Qty',
      likes: 'likes',
      comments: 'comments',
      commentsLabel: 'Comments:',
      viewAllComments: 'View all',
      pending: 'Pending',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      logout: 'Logout',
      settings: 'Settings',
      confirmLogout: 'Confirm Logout',
      areYouSureLogout: 'Are you sure you want to logout?',
      yesLogout: 'Yes, Logout',
      cancel: 'Cancel',
      totalItems: 'Total Items',
      totalOrders: 'Total Orders',
      totalReviews: 'Total Reviews',
      averageRating: 'Average Rating',
      itemsInWishlist: 'items in your wishlist',
      startShopping: 'Start Shopping',
      browseArtworks: 'Browse Artworks',
      orderDate: 'Order Date',
      orderId: 'Order ID',
      totalAmount: 'Total Amount',
      orderStatus: 'Order Status',
      viewDetails: 'View Details',
      yourReviews: 'Your Reviews',
      reviewOn: 'Review on',
      noItemsYet: 'No items yet',
      noOrdersYet: 'No orders yet',
      noReviewsYet: 'No reviews yet',
      returnOrder: 'Return Order',
      returnOrderConfirm: 'Are you sure you want to return this order?',
      orderReturned: 'Order return request submitted successfully',
      orderReturnFailed: 'Failed to return order',
      returnTimeExpired: 'Order can only be returned within 3 days of delivery',
      returned: 'Returned',
      congratulations: 'Congratulations!',
      artistApproved: 'You Got Approved!',
      artistApprovedMessage: 'Great news! Your artist registration has been approved. You can now start selling your artworks and earning money.',
      viewDashboard: 'Go to Artist Dashboard',
      close: 'Close',
      following: 'Following',
      followingArtists: 'Following Artists',
      noFollowing: 'You are not following any artists yet',
      startFollowing: 'Start Following Artists',
      viewProfile: 'View Profile',
      message: 'Message',
      artworksFromFollowing: 'Artworks from Artists You Follow',
    },
    hi: {
      changeLanguage: 'भाषा बदलें',
      english: 'अंग्रेजी',
      hindi: 'हिंदी',
      peterArt: 'पीटर आर्ट',
      fallInLove: 'कला से प्यार करें',
      turnEmptyWalls: 'खाली दीवारों को अभिव्यक्ति में बदलें',
      securePayment: 'विश्वसनीय भुगतान और उसी दिन ऑर्डर ट्रैकिंग',
      searchArtworks: 'कलाकृतियां खोजें...',
      menu: 'मेनू',
      artworks: 'कलाकृतियां',
      wishlist: 'इच्छा सूची',
      myOrders: 'मेरे ऑर्डर',
      myReviews: 'मेरी समीक्षाएं',
      helpSupport: 'सहायता और समर्थन',
      myGiftCards: 'मेरे गिफ्ट कार्ड',
      myProfile: 'मेरी प्रोफ़ाइल',
      artistDashboard: 'कलाकार डैशबोर्ड',
      buy: 'खरीदें',
      buyNow: 'अभी खरीदें',
      loading: 'लोड हो रहा है...',
      loadingArtworks: 'कलाकृतियां लोड हो रही हैं...',
      wishlistEmpty: 'आपकी इच्छा सूची खाली है',
      noOrders: 'आपके पास अभी कोई ऑर्डर नहीं है',
      orderConfirmed: 'ऑर्डर पुष्टि',
      cancelOrder: 'ऑर्डर रद्द करें',
      cancelOrderConfirm: 'क्या आप वाकई इस ऑर्डर को रद्द करना चाहते हैं?',
      orderCancelled: 'ऑर्डर सफलतापूर्वक रद्द कर दिया गया',
      orderCancelFailed: 'ऑर्डर रद्द करने में विफल',
      cancelTimeExpired: 'ऑर्डर केवल प्लेसमेंट के 1 घंटे के भीतर रद्द किया जा सकता है',
      noReviews: 'आपने अभी तक कोई समीक्षा नहीं दी है',
      noResultsFound: 'के लिए कोई परिणाम नहीं मिला',
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
      quantity: 'मात्रा',
      likes: 'पसंद',
      comments: 'टिप्पणियां',
      commentsLabel: 'टिप्पणियां:',
      viewAllComments: 'सभी देखें',
      pending: 'लंबित',
      delivered: 'डिलीवर',
      cancelled: 'रद्द',
      logout: 'लॉगआउट',
      settings: 'सेटिंग्स',
      confirmLogout: 'लॉगआउट की पुष्टि करें',
      areYouSureLogout: 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
      yesLogout: 'हाँ, लॉगआउट करें',
      cancel: 'रद्द करें',
      totalItems: 'कुल आइटम',
      totalOrders: 'कुल ऑर्डर',
      totalReviews: 'कुल समीक्षाएं',
      averageRating: 'औसत रेटिंग',
      itemsInWishlist: 'आइटम आपकी इच्छा सूची में',
      startShopping: 'खरीदारी शुरू करें',
      browseArtworks: 'कलाकृतियां देखें',
      orderDate: 'ऑर्डर की तारीख',
      orderId: 'ऑर्डर आईडी',
      totalAmount: 'कुल राशि',
      orderStatus: 'ऑर्डर स्थिति',
      viewDetails: 'विवरण देखें',
      yourReviews: 'आपकी समीक्षाएं',
      reviewOn: 'समीक्षा',
      noItemsYet: 'अभी तक कोई आइटम नहीं',
      noOrdersYet: 'अभी तक कोई ऑर्डर नहीं',
      noReviewsYet: 'अभी तक कोई समीक्षा नहीं',
      returnOrder: 'ऑर्डर वापस करें',
      returnOrderConfirm: 'क्या आप वाकई इस ऑर्डर को वापस करना चाहते हैं?',
      orderReturned: 'ऑर्डर वापसी अनुरोध सफलतापूर्वक जमा किया गया',
      orderReturnFailed: 'ऑर्डर वापस करने में विफल',
      returnTimeExpired: 'ऑर्डर केवल डिलीवरी के 3 दिनों के भीतर वापस किया जा सकता है',
      returned: 'वापस किया गया',
      congratulations: 'बधाई हो!',
      artistApproved: 'आपको मंजूरी मिल गई!',
      artistApprovedMessage: 'बढ़िया खबर! आपके कलाकार पंजीकरण को मंजूरी मिल गई है। अब आप अपनी कलाकृतियां बेचना और पैसा कमाना शुरू कर सकते हैं।',
      viewDashboard: 'कलाकार डैशबोर्ड पर जाएं',
      close: 'बंद करें',
      following: 'फॉलो किए गए',
      followingArtists: 'फॉलो किए गए कलाकार',
      noFollowing: 'आप अभी किसी कलाकार को फॉलो नहीं कर रहे हैं',
      startFollowing: 'कलाकारों को फॉलो करना शुरू करें',
      viewProfile: 'प्रोफ़ाइल देखें',
      message: 'संदेश',
      artworksFromFollowing: 'आपके फॉलो किए गए कलाकारों की कलाकृतियां',
    },
  } as const

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
    toast.success(lang === 'en' ? 'Language changed to English' : 'भाषा हिंदी में बदली गई')
  }

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['artworks', 'wishlist', 'orders', 'reviews', 'support', 'profile', 'giftcards', 'artist', 'following'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    loadData()
  }, [user])

  // Check for artist approval status change
  useEffect(() => {
    if (artistProfile && user) {
      const currentStatus = artistProfile.status
      const storageKey = `artist_approval_shown_${user.uid}_${artistProfile.id}`
      const lastKnownStatusKey = `artist_last_status_${user.uid}_${artistProfile.id}`
      
      // Get last known status from localStorage
      const lastKnownStatus = localStorage.getItem(lastKnownStatusKey)
      
      // Check if status changed from pending to approved
      if (currentStatus === 'approved') {
        // Check if we've already shown this congratulations
        const alreadyShown = localStorage.getItem(storageKey)
        
        // Show congratulations if:
        // 1. Status is approved AND
        // 2. Previous status was pending (either from state or localStorage) AND
        // 3. We haven't shown it before
        if (!alreadyShown && (previousArtistStatus === 'pending' || lastKnownStatus === 'pending')) {
          setShowCongratulations(true)
          localStorage.setItem(storageKey, 'true')
        }
      }
      
      // Update previous status and localStorage
      if (currentStatus !== previousArtistStatus) {
        setPreviousArtistStatus(currentStatus)
        localStorage.setItem(lastKnownStatusKey, currentStatus)
      } else if (previousArtistStatus === null && currentStatus) {
        // First time loading, set initial status
        setPreviousArtistStatus(currentStatus)
        localStorage.setItem(lastKnownStatusKey, currentStatus)
      }
    }
  }, [artistProfile, previousArtistStatus, user])

  // Track viewport for responsive overlays
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobileView(window.innerWidth < 768)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when sidebar or mobile menu is open
  useEffect(() => {
    const overlayActive = sidebarOpen
    if (overlayActive) {
      document.documentElement.classList.add('overflow-hidden')
      document.body.classList.add('overflow-hidden')
    } else {
      document.documentElement.classList.remove('overflow-hidden')
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.documentElement.classList.remove('overflow-hidden')
      document.body.classList.remove('overflow-hidden')
    }
  }, [sidebarOpen, isMobileView])

  // Filtered artworks will be updated by SearchFilters component

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
        
        // Check if user is an artist
        const artistData = await getArtistByUserId(user.uid)
        if (artistData) {
          setIsArtist(true)
          // Set previous status if not set yet
          if (previousArtistStatus === null) {
            setPreviousArtistStatus(artistData.status)
          }
          setArtistProfile(artistData)
        } else {
          setIsArtist(false)
          setArtistProfile(null)
          setPreviousArtistStatus(null)
        }
        
        // Load following artists
        await loadFollowingArtists(user.uid)
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
    if (tab === 'wishlist' || tab === 'orders' || tab === 'reviews' || tab === 'support' || tab === 'profile') {
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

  const loadFollowingArtists = async (userId: string) => {
    try {
      const following = await getUserFollowing(userId)
      const artistPromises = following.map((f: any) => getArtistById(f.artistId))
      const artists = await Promise.all(artistPromises)
      setFollowingArtists(artists.filter(a => a !== null))
    } catch (error) {
      console.error('Error loading following artists:', error)
    }
  }

  const loadArtistArtworks = async (artistId: string) => {
    if (artistArtworks[artistId]) {
      // Already loaded, just toggle
      return
    }

    setLoadingArtworks(prev => ({ ...prev, [artistId]: true }))
    try {
      const allArts = await getAllArtworks()
      const filtered = allArts.filter((art: any) => art.artistId === artistId)
      setArtistArtworks(prev => ({ ...prev, [artistId]: filtered }))
    } catch (error) {
      console.error('Error loading artist artworks:', error)
      toast.error('Failed to load artworks')
    } finally {
      setLoadingArtworks(prev => ({ ...prev, [artistId]: false }))
    }
  }

  const handleArtistClick = (artistId: string) => {
    if (expandedArtistId === artistId) {
      setExpandedArtistId(null)
    } else {
      setExpandedArtistId(artistId)
      loadArtistArtworks(artistId)
    }
  }

  const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    
    if (!confirm(t.cancelOrderConfirm)) {
      return
    }
    
    try {
      await cancelOrder(orderId)
      toast.success(t.orderCancelled)
      // Reload orders
      if (user) {
        const ords = await getUserOrders(user.uid)
        setOrders(ords)
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error)
      toast.error(error.message || t.orderCancelFailed)
    }
  }

  const canCancelOrder = (order: any) => {
    // Check if order can be cancelled (within 1 hour and not delivered/cancelled)
    if (order.status === 'delivered' || order.status === 'cancelled' || order.status === 'returned') {
      return false
    }
    
    const orderDate = new Date(order.createdAt)
    const now = new Date()
    const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceOrder <= 1
  }

  const canReturnOrder = (order: any) => {
    // Check if order is delivered
    if (order.status !== 'delivered') {
      return false
    }
    
    // Check if order is already returned
    if (order.status === 'returned') {
      return false
    }
    
    // Check if order was delivered within 3 days
    // Use deliveredAt if available, otherwise use updatedAt when status changed to delivered
    const deliveredDate = order.deliveredAt 
      ? new Date(order.deliveredAt)
      : order.updatedAt && order.status === 'delivered'
      ? new Date(order.updatedAt)
      : null
    
    if (!deliveredDate) {
      // If we can't determine delivery date, check if updatedAt exists and status is delivered
      // This is a fallback for orders that were delivered before we added deliveredAt tracking
      if (order.updatedAt && order.status === 'delivered') {
        const updatedDate = new Date(order.updatedAt)
        const now = new Date()
        const daysSinceDelivery = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceDelivery <= 3
      }
      return false
    }
    
    const now = new Date()
    const daysSinceDelivery = (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
    
    return daysSinceDelivery <= 3
  }

  const handleReturnOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm(t.returnOrderConfirm)) {
      return
    }
    
    try {
      await returnOrder(orderId)
      toast.success(t.orderReturned)
      // Reload orders
      if (user && user.uid) {
        const ords = await getUserOrders(user.uid)
        setOrders(ords)
      }
    } catch (error: any) {
      console.error('Error returning order:', error)
      const errorMessage = error.message || t.orderReturnFailed
      // Check if error is about time expiration
      if (errorMessage.includes('3 days') || errorMessage.includes('within')) {
        toast.error(t.returnTimeExpired)
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t.orderConfirmed
      case 'pending':
        return t.pending
      case 'delivered':
        return t.delivered
      case 'cancelled':
        return t.cancelled
      case 'returned':
        return t.returned
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const insightCards = [
    {
      label: t.totalItems,
      value: filteredArtworks.length,
      helper: t.browseArtworks,
      accent: 'from-orange-50/80 to-white',
      border: 'border-orange-100'
    },
    {
      label: t.totalOrders,
      value: orders.length,
      helper: t.myOrders,
      accent: 'from-blue-50/80 to-white',
      border: 'border-blue-100'
    },
    {
      label: t.itemsInWishlist,
      value: wishlist.length,
      helper: t.wishlist,
      accent: 'from-pink-50/80 to-white',
      border: 'border-pink-100'
    },
    {
      label: t.totalReviews,
      value: myReviews.length,
      helper: t.yourReviews,
      accent: 'from-purple-50/80 to-white',
      border: 'border-purple-100'
    }
  ]

  const quickActions = [
    {
      id: 'artworks',
      title: t.artworks,
      description: t.startShopping,
      accent: 'from-orange-500 to-pink-500',
      icon: FiArrowRight
    },
    {
      id: 'wishlist',
      title: t.wishlist,
      description: t.addToWishlist,
      accent: 'from-pink-500 to-rose-500',
      icon: FiHeart
    },
    {
      id: 'orders',
      title: t.myOrders,
      description: t.orderStatus,
      accent: 'from-blue-500 to-indigo-500',
      icon: FiPackage
    },
    {
      id: 'support',
      title: t.helpSupport,
      description: t.helpSupport,
      accent: 'from-violet-500 to-purple-500',
      icon: FiHelpCircle
    },
    ...(isArtist
      ? [
          {
            id: 'artist' as const,
            title: t.artistDashboard,
            description: t.viewDashboard,
            accent: 'from-emerald-500 to-teal-500',
            icon: FiTrendingUp
          }
        ]
      : [])
  ]

  const navTabs = [
    { id: 'artworks', label: t.artworks, icon: FiSearch },
    { id: 'wishlist', label: t.wishlist, icon: FiHeart },
    { id: 'following', label: t.following, icon: FiUser, hidden: !user },
    { id: 'orders', label: t.myOrders, icon: FiShoppingCart },
    { id: 'reviews', label: t.myReviews, icon: FiStar },
    { id: 'support', label: t.helpSupport, icon: FiHelpCircle },
    { id: 'profile', label: t.myProfile, icon: FiSettings, hidden: !user },
    { id: 'giftcards', label: t.myGiftCards, icon: FiDollarSign, hidden: !user },
    { id: 'artist', label: t.artistDashboard, icon: FiTrendingUp, hidden: !isArtist },
  ].filter(tab => !tab.hidden)

  const heroGreeting = user?.displayName || user?.email?.split('@')[0] || (language === 'hi' ? 'मित्र' : 'Collector')

  return (
    <div className="space-y-4 md:space-y-6 pb-24">
      {/* Centered Logo Image - Hidden on mobile for profile and orders tabs */}
      <div className={`flex flex-col justify-center items-center py-4 md:py-6 ${(activeTab === 'profile' || activeTab === 'orders') ? 'hidden md:flex' : ''}`}>
        <img
          src="https://png.pngtree.com/png-vector/20240618/ourmid/pngtree-a-cute-girl-dancing-colorful-art-design-png-image_12793513.png"
          alt="Peter Art"
          className="w-36 h-36 md:w-32 md:h-32 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logoo.png'
          }}
        />
        <h1 className="text-lg md:text-2xl font-bold text-gray-700 mt-3">{t.peterArt}</h1>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {/* Backdrop with fade effect */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[200] transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            style={{ backdropFilter: 'blur(3px)' }}
          ></div>
          
          {/* Compact Sidebar Menu */}
          <div className="fixed inset-0 z-[201] flex items-start justify-start md:justify-center p-0 md:p-8 pointer-events-none">
            <div className="w-[75vw] max-w-[260px] md:w-[260px] bg-white h-full md:h-auto md:rounded-xl md:max-h-[90vh] shadow-2xl overflow-hidden pointer-events-auto animate-slideInLeft border-r border-gray-100 md:border-r-0 md:border md:border-gray-200">
              {/* Compact Header */}
              <div className="p-3 md:p-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {user ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                          {(user.displayName || user.email?.split('@')[0] || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-xs md:text-sm font-bold text-gray-900 truncate">{user.displayName || user.email?.split('@')[0]}</h2>
                          <p className="text-[9px] md:text-[10px] text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center shadow-sm flex-shrink-0">
                          <img
                            src="https://png.pngtree.com/png-vector/20240618/ourmid/pngtree-a-cute-girl-dancing-colorful-art-design-png-image_12793513.png"
                            alt="Peter Art"
                            className="w-7 h-7 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logoo.png'
                            }}
                          />
                        </div>
                        <h2 className="text-sm md:text-base font-bold text-gray-900">Menu</h2>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-all duration-200 flex-shrink-0 active:scale-95 touch-manipulation"
                    aria-label="Close menu"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
              </div>
              
              {/* Compact Navigation Menu - Orange Active State with Realistic Icons */}
              <nav className="py-2 md:py-3 max-h-[calc(100vh-180px)] overflow-y-auto overscroll-contain">
                {navTabs.map((tab) => {
                  const isActiveTab = activeTab === tab.id
                  
                  // Enhanced icon mapping with filled/realistic versions
                  const iconMap: Record<string, any> = {
                    artworks: isActiveTab ? FaSearch : HiSearch,
                    wishlist: isActiveTab ? FaHeart : HiHeart,
                    following: isActiveTab ? FaUser : HiUser,
                    orders: isActiveTab ? FaShoppingCart : HiShoppingCart,
                    reviews: isActiveTab ? FaStar : HiStar,
                    support: isActiveTab ? FaQuestionCircle : HiQuestionMarkCircle,
                    profile: isActiveTab ? FaCog : HiCog,
                    giftcards: isActiveTab ? FaDollarSign : HiCurrencyDollar,
                    artist: isActiveTab ? FaChartLine : HiTrendingUp,
                  }
                  
                  const Icon = iconMap[tab.id] || tab.icon
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleNavClick(tab.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 md:py-2 text-xs md:text-sm font-semibold transition-all duration-300 mx-2 rounded-lg mb-1.5 relative overflow-hidden active:scale-[0.98] touch-manipulation ${
                        isActiveTab
                          ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/40'
                          : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      {/* Shine effect for active items */}
                      {isActiveTab && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                      )}
                      {/* Icon with enhanced realistic styling */}
                      <div className={`flex items-center justify-center w-8 h-8 md:w-7 md:h-7 rounded-lg flex-shrink-0 relative z-10 transition-all ${
                        isActiveTab 
                          ? 'bg-white/25 backdrop-blur-sm shadow-inner' 
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50'
                      }`}>
                        {iconMap[tab.id] ? (
                          <Icon 
                            className={`text-base md:text-sm relative z-10 ${
                              isActiveTab ? 'text-white drop-shadow-lg' : 'text-gray-700'
                            }`}
                            style={{
                              filter: isActiveTab 
                                ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
                                : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                            }}
                          />
                        ) : (
                          <Icon 
                            className={`text-base md:text-sm relative z-10 ${
                              isActiveTab ? 'text-white drop-shadow-lg' : 'text-gray-700'
                            }`}
                            strokeWidth={isActiveTab ? 2.5 : 2}
                            style={{
                              filter: isActiveTab 
                                ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
                                : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                            }}
                          />
                        )}
                      </div>
                      <span className="flex-1 text-left relative z-10">{tab.label}</span>
                      {isActiveTab && (
                        <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 relative z-10 shadow-md ring-1 ring-white/50"></div>
                      )}
                    </button>
                  )
                })}
                {/* Messages Link - Compact with Realistic Icon */}
                {user && (
                  <button
                    onClick={() => {
                      router.push('/messages')
                      setSidebarOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-2 text-xs md:text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all mx-2 rounded-lg mb-1.5 touch-manipulation"
                  >
                    <div className="flex items-center justify-center w-8 h-8 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50 flex-shrink-0">
                      <HiChatAlt2 
                        className="text-base md:text-sm text-gray-700 flex-shrink-0" 
                        style={{ 
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                          strokeWidth: 0
                        }}
                      />
                    </div>
                    <span className="flex-1 text-left">{language === 'hi' ? 'संदेश' : 'Messages'}</span>
                  </button>
                )}

                {/* Divider - Compact */}
                {user && (
                  <div className="border-t border-gray-100 my-3 mx-3"></div>
                )}

                {/* Language Selection - Compact */}
                {user && (
                  <div className="px-3 py-2.5 md:py-3 bg-gradient-to-br from-gray-50 to-white mx-2 rounded-lg border border-gray-100">
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">{t.changeLanguage}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`flex-1 px-2.5 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all duration-300 active:scale-95 touch-manipulation ${
                          language === 'en'
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                        }`}
                      >
                        {t.english}
                      </button>
                      <button
                        onClick={() => changeLanguage('hi')}
                        className={`flex-1 px-2.5 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all duration-300 active:scale-95 touch-manipulation ${
                          language === 'hi'
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                        }`}
                      >
                        {t.hindi}
                      </button>
                    </div>
                  </div>
                )}

                {/* Logout - Compact */}
                {user && (
                  <div className="px-3 py-3 md:py-4 border-t border-gray-100 bg-gradient-to-br from-red-50/50 to-white mt-2">
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true)
                        setSidebarOpen(false)
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 md:py-2.5 text-xs md:text-sm font-bold text-white bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:via-red-700 hover:to-red-800 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] touch-manipulation"
                    >
                      <FiLogOut 
                        className="text-base md:text-sm" 
                        strokeWidth={2.5}
                      />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
            </nav>
          </div>
        </div>
        </>
      )}

      {/* Compact Professional Menu Button */}
      <div className="mb-4 flex items-center justify-between gap-2.5 px-2 md:px-0">
        <div className="flex items-center gap-2.5 flex-1">
        {/* Menu Button - Compact */}
        <button
          onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-gray-900 border border-gray-200 shadow-md hover:bg-gray-50 hover:shadow-lg transition-all font-medium active:scale-95 z-10"
        >
          <FiMenu className="text-base" />
          <span className="hidden sm:inline text-xs">Menu</span>
        </button>

        {/* Current Tab Display - Compact Badge */}
        {navTabs.find(tab => tab.id === activeTab) && (
          <div className="flex items-center gap-2.5 flex-1 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm hover:shadow transition-all">
            {(() => {
              const currentTab = navTabs.find(tab => tab.id === activeTab)
              const Icon = currentTab?.icon
              
              // Colorful icon colors for current tab badge
              const badgeIconColors: Record<string, string> = {
                artworks: 'text-blue-600',
                wishlist: 'text-pink-600',
                following: 'text-purple-600',
                orders: 'text-orange-600',
                reviews: 'text-amber-600',
                support: 'text-green-600',
                profile: 'text-indigo-600',
                giftcards: 'text-emerald-600',
                artist: 'text-cyan-600',
              }
              
              return Icon ? (
                <div className={`flex items-center justify-center w-7 h-7 rounded-md bg-gray-100`}>
                  <Icon className={`text-sm ${badgeIconColors[currentTab?.id || ''] || 'text-gray-700'}`} />
                </div>
              ) : null
            })()}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 font-medium">Current</p>
              <p className="text-xs font-semibold text-gray-900 truncate">
                {navTabs.find(tab => tab.id === activeTab)?.label}
              </p>
            </div>
          </div>
        )}
        </div>
        
        {/* Shopping Cart Icon - Right Corner */}
        <div className="flex-shrink-0">
          <Cart />
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="space-y-4 md:space-y-6">
        {activeTab === 'artworks' && (
          <div className="space-y-4 md:space-y-6">
            {/* Premium Search Section */}
            <div className="bg-white rounded-none md:rounded-2xl border-0 md:border border-gray-100 p-3 md:p-6 shadow-sm mx-0 md:mx-0">
            <SearchFilters
              artworks={artworks}
              onFilterChange={setFilteredArtworks}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              language={language}
              filteredCount={filteredArtworks.length}
            />
          </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm">{t.loadingArtworks}</p>
              </div>
            ) : filteredArtworks.length === 0 && searchTerm ? (
              <div className="text-center py-12">
                <FiSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">
                  {t.noResultsFound} "<span className="font-semibold">{searchTerm}</span>"
                </p>
              </div>
            ) : filteredArtworks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">{t.loadingArtworks}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 px-0 md:px-0">
                {filteredArtworks.map((artwork: any) => (
                  <div key={artwork.id} className="group bg-white rounded-lg md:rounded-2xl border border-gray-100 p-1.5 md:p-3 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                    {artwork.images && artwork.images[0] ? (
                      <div className="relative mb-2 md:mb-3 h-24 md:h-40 w-full overflow-hidden rounded-lg md:rounded-xl bg-gray-100">
                        <img
                          src={artwork.images[0]}
                          alt={artwork.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 md:h-40 mb-2 md:mb-3 rounded-lg md:rounded-xl bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-[10px] md:text-xs">{t.noImage}</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-[11px] md:text-sm mb-0.5 md:mb-1 line-clamp-1 text-gray-900">{artwork.title}</h3>
                    <p className="text-gray-600 text-[10px] md:text-xs mb-1.5 md:mb-2 line-clamp-1 md:line-clamp-2 min-h-[1rem] md:min-h-[2.5rem]">{artwork.description}</p>
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <p className="text-gray-900 font-bold text-xs md:text-base">₹{artwork.price}</p>
                      <div className="flex items-center gap-1">
                        <FiThumbsUp className={`text-xs md:text-sm ${artwork.likedBy?.includes(user?.uid) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                        <span className="text-[10px] md:text-xs text-gray-500">{artwork.likes || 0}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 md:gap-2">
                      <button
                        onClick={() => handleWishlist(artwork.id)}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg md:rounded-xl py-1.5 md:py-2.5 text-[10px] md:text-xs font-semibold transition-all border ${
                          wishlist.includes(artwork.id) 
                            ? 'bg-red-50 text-red-600 border-red-200' 
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {wishlist.includes(artwork.id) ? <FaHeart className="text-xs md:text-sm" /> : <FiHeart className="text-xs md:text-sm" />}
                      </button>
                      <button
                        onClick={() => handleBuyClick(artwork.id)}
                        className="flex-1 bg-gray-900 text-white rounded-lg md:rounded-xl py-1.5 md:py-2.5 text-[10px] md:text-xs font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
                      >
                        {t.buy}
                      </button>
                    </div>

                  </div>
                ))}
                 </div>
               )}

               {filteredArtworks.length > 0 && (
              <div className="mt-6 space-y-4">
                   {user ? (
                     <>
                       <RecommendationSection
                         userId={user.uid}
                         type="personalized"
                         limit={10}
                         language={language}
                       />
                       {/* Banner Ad between For You and Because You Liked sections */}
                       <BannerAd inline={true} />
                       <RecommendationSection
                         userId={user.uid}
                         type="becauseYouLiked"
                         limit={10}
                         language={language}
                       />
                     </>
                   ) : (
                  <RecommendationSection type="trending" limit={8} language={language} />
                )}
              </div>
               )}
             </div>
           )}

           {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4 rounded-3xl bg-white/95 p-4 shadow-lg sm:p-6">
            {/* Header with Statistics */}
            <div className="card p-4 bg-gradient-to-br from-orange-50 via-white to-red-50 border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <FiHeart className="text-2xl text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">{t.wishlist}</h2>
                  <p className="text-xs md:text-sm text-gray-600">
                    {wishlist.length} {t.itemsInWishlist}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{wishlist.length}</div>
                  <div className="text-xs text-gray-500">{t.totalItems}</div>
                </div>
              </div>
            </div>

            {wishlist.length === 0 ? (
              <div className="card p-6 md:p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
                  <FiHeart className="text-4xl text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t.noItemsYet}</h3>
                <p className="text-sm text-gray-600 mb-4">{t.wishlistEmpty}</p>
                <button
                  onClick={() => handleNavClick('artworks')}
                  className="btn-primary flex items-center gap-2 mx-auto text-sm py-2.5 px-6"
                >
                  <FiArrowRight className="text-sm" />
                  {t.browseArtworks}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {artworks
                  .filter((artwork: any) => wishlist.includes(artwork.id))
                  .map((artwork: any) => (
                    <div key={artwork.id} className="card p-2 md:p-3 hover:shadow-lg transition-shadow">
                      {artwork.images && artwork.images[0] ? (
                        <div className="relative w-full h-32 md:h-40 mb-2 rounded-lg overflow-hidden group">
                          <img
                            src={artwork.images[0]}
                            alt={artwork.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                          }}
                        />
                          <div className="absolute top-2 right-2">
                            <div className="p-1.5 bg-white rounded-full shadow-md">
                              <FaHeart className="text-sm text-red-500" />
                            </div>
                          </div>
                      </div>
                    ) : (
                        <div className="w-full h-32 md:h-40 mb-2 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">{t.noImage}</span>
                      </div>
                    )}
                      <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1">{artwork.title}</h3>
                      {artwork.artistId && (
                        <div className="mb-1">
                          <ArtistBadge artistId={artwork.artistId} />
                        </div>
                      )}
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2 hidden md:block">{artwork.description}</p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-orange-600 font-bold text-base md:text-lg">₹{artwork.price}</p>
                        {artwork.likes > 0 && (
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <FiThumbsUp className="text-xs" />
                            <span>{artwork.likes}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleBuyClick(artwork.id)}
                        className="btn-primary w-full text-xs md:text-sm py-2 font-semibold"
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
          <div className="space-y-2 md:space-y-4 rounded-3xl bg-white/95 p-2 md:p-6 shadow-lg">
            {/* Header with Statistics */}
            <div className="card p-2 md:p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-100">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                  <FiShoppingCart className="text-lg md:text-2xl text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm md:text-xl font-bold text-gray-900">{t.myOrders}</h2>
                  <p className="text-[10px] md:text-sm text-gray-600">
                    {orders.length} {orders.length === 1 ? t.myOrders.slice(0, -1) : t.myOrders} placed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg md:text-3xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-[10px] md:text-xs text-gray-500">{t.totalOrders}</div>
                </div>
              </div>
              {orders.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 md:gap-2 pt-2 md:pt-3 border-t border-blue-100">
                  <div className="text-center p-1.5 md:p-2 bg-white rounded-lg">
                    <div className="text-sm md:text-lg font-bold text-green-600">
                      {orders.filter((o: any) => o.status === 'delivered').length}
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-600">{t.delivered}</div>
                  </div>
                  <div className="text-center p-1.5 md:p-2 bg-white rounded-lg">
                    <div className="text-sm md:text-lg font-bold text-yellow-600">
                      {orders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length}
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-600">{t.pending}</div>
                  </div>
                </div>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="card p-4 md:p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-2 md:mb-4">
                  <FiShoppingCart className="text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{t.noOrdersYet}</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4">{t.noOrders}</p>
                <button
                  onClick={() => handleNavClick('artworks')}
                  className="btn-primary flex items-center gap-1 md:gap-2 mx-auto text-xs md:text-sm py-1.5 md:py-2.5 px-4 md:px-6"
                >
                  <FiArrowRight className="text-xs md:text-sm" />
                  {t.startShopping}
                </button>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {orders.map((order: any) => {
                  const canCancel = canCancelOrder(order)
                  const canReturn = canReturnOrder(order)
                  const orderDate = new Date(order.createdAt)
                  return (
                  <div 
                    key={order.id} 
                      className="card p-2 md:p-4 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                  >
                      <div className="flex gap-2 md:gap-4">
                    {order.artworkImage ? (
                          <div 
                            className="relative w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                            onClick={() => order.artworkId && router.push(`/artwork/${order.artworkId}`)}
                          >
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
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                            <FiPackage className="text-xl md:text-2xl text-gray-400" />
                      </div>
                    )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 md:gap-2 mb-1 md:mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 
                                className="font-bold text-xs md:text-base mb-0.5 md:mb-1 line-clamp-1 cursor-pointer hover:text-blue-600"
                                onClick={() => order.artworkId && router.push(`/artwork/${order.artworkId}`)}
                              >
                                {order.artworkTitle}
                              </h3>
                              <div className="flex flex-wrap items-center gap-1 md:gap-2 text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">
                                <span className="flex items-center gap-0.5 md:gap-1">
                                  <FiCalendar className="text-[10px] md:text-xs" />
                                  {orderDate.toLocaleDateString()}
                                </span>
                                <span className="hidden md:inline">•</span>
                                <span className="hidden md:inline">#{order.id.slice(0, 8)}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-semibold whitespace-nowrap ${
                              order.status === 'confirmed' 
                                ? 'bg-blue-100 text-blue-800' 
                                : order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                                : order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : order.status === 'returned'
                                ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                              {getStatusLabel(order.status)}
                            </span>
                  </div>
                          <div className="flex items-center justify-between mb-1.5 md:mb-2">
                            <div className="text-[10px] md:text-xs text-gray-600">
                              {t.quantity}: <span className="font-semibold">{order.quantity || 1}</span> × ₹{order.unitPrice || order.total}
              </div>
                            <div className="flex items-center gap-0.5 md:gap-1 text-sm md:text-lg font-bold text-gray-900">
                              <FiDollarSign className="text-xs md:text-sm" />
                              ₹{order.total}
                            </div>
                          </div>
                          <div className="flex gap-1.5 md:gap-2 flex-wrap">
                            {canCancel && (
                              <button
                                onClick={(e) => handleCancelOrder(order.id, e)}
                                className="flex-1 text-[10px] md:text-sm py-1.5 md:py-2 px-2 md:px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                              >
                                {t.cancelOrder}
                              </button>
                            )}
                            {canReturn && (
                              <button
                                onClick={(e) => handleReturnOrder(order.id, e)}
                                className="flex-1 text-[10px] md:text-sm py-1.5 md:py-2 px-2 md:px-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                              >
                                {t.returnOrder}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrderForTracking(order)}
                              className="text-[10px] md:text-sm py-1.5 md:py-2 px-2 md:px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-0.5 md:gap-1"
                            >
                              <FiPackage className="text-[10px] md:text-xs" />
                              Track Order
                            </button>
                            <button
                              onClick={() => order.artworkId && router.push(`/artwork/${order.artworkId}`)}
                              className={`text-[10px] md:text-sm py-1.5 md:py-2 px-2 md:px-3 btn-secondary font-semibold flex items-center justify-center gap-0.5 md:gap-1 ${canCancel || canReturn ? 'flex-1' : 'w-full'}`}
                            >
                              {t.viewDetails}
                              <FiArrowRight className="text-[10px] md:text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* My Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 rounded-3xl bg-white/95 p-4 shadow-lg sm:p-6">
            {/* Header with Statistics */}
            <div className="card p-4 bg-gradient-to-br from-purple-50 via-white to-orange-50 border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-orange-500 rounded-lg">
                  <FiStar className="text-2xl text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">{t.yourReviews}</h2>
                  <p className="text-xs md:text-sm text-gray-600">
                    {myReviews.length} {myReviews.length === 1 ? t.yourReviews.slice(0, -1) : t.yourReviews} submitted
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">{myReviews.length}</div>
                  <div className="text-xs text-gray-500">{t.totalReviews}</div>
                </div>
              </div>
              {myReviews.length > 0 && (
                <div className="pt-3 border-t border-purple-100">
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-yellow-500">
                        {(myReviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / myReviews.length || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">{t.averageRating}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`text-lg ${
                            star <= Math.round(myReviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / myReviews.length || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {myReviews.length === 0 ? (
              <div className="card p-6 md:p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full mb-4">
                  <FiMessageCircle className="text-4xl text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t.noReviewsYet}</h3>
                <p className="text-sm text-gray-600 mb-4">{t.noReviews}</p>
                <button
                  onClick={() => handleNavClick('artworks')}
                  className="btn-primary flex items-center gap-2 mx-auto text-sm py-2.5 px-6"
                >
                  <FiArrowRight className="text-sm" />
                  {t.browseArtworks}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myReviews.map((review: any) => {
                  const reviewDate = new Date(review.createdAt)
                  return (
                    <div key={review.id} className="card p-3 md:p-4 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                      <div className="flex gap-3 md:gap-4">
                      {review.artworkImage && (
                          <div 
                            className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                            onClick={() => router.push(`/artwork/${review.artworkId}`)}
                          >
                          <img
                            src={review.artworkImage}
                            alt={review.artworkTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 
                                className="font-bold text-sm md:text-base mb-1 line-clamp-1 cursor-pointer hover:text-purple-600"
                          onClick={() => router.push(`/artwork/${review.artworkId}`)}
                        >
                          {review.artworkTitle}
                        </h3>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <FiCalendar className="text-xs" />
                                  {reviewDate.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                        {review.rating && (
                              <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded-lg">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                    className={`text-sm ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                          </div>
                        {review.text && (
                            <p className="text-gray-700 text-sm mb-3 leading-relaxed bg-gray-50 p-2 rounded-lg">
                              {review.text}
                            </p>
                        )}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                                <FiThumbsUp className="text-sm" />
                                <span className="font-semibold">{review.likes || 0}</span>
                                <span className="hidden md:inline">{t.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                                <FiMessageCircle className="text-sm" />
                                <span className="font-semibold">{review.replies?.length || 0}</span>
                                <span className="hidden md:inline">{t.comments}</span>
                          </div>
                            </div>
                            <button
                              onClick={() => router.push(`/artwork/${review.artworkId}`)}
                              className="text-xs md:text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                            >
                              {t.viewDetails}
                              <FiArrowRight className="text-xs" />
                            </button>
                        </div>
                        {review.replies && review.replies.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <FiMessageCircle className="text-sm" />
                                {t.commentsLabel} ({review.replies.length})
                              </p>
                              <div className="space-y-2">
                            {review.replies.slice(0, 2).map((reply: any) => (
                                  <div key={reply.id} className="text-xs md:text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                    <span className="font-semibold text-gray-900">{reply.userName}:</span> {reply.text}
                              </div>
                            ))}
                            {review.replies.length > 2 && (
                              <button
                                onClick={() => router.push(`/artwork/${review.artworkId}`)}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                              >
                                    {t.viewAllComments} {review.replies.length} {t.comments}
                                    <FiArrowRight className="text-xs" />
                              </button>
                            )}
                              </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Help & Support Tab */}
        {activeTab === 'support' && (
          <div className="rounded-3xl bg-white/95 p-4 shadow-lg sm:p-6">
            <HelpSupport user={user} language={language} />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="rounded-3xl bg-white/95 p-4 shadow-lg sm:p-6">
            <UserProfile user={user} onProfileUpdate={onUserUpdate} language={language} />
          </div>
        )}

        {/* Gift Cards Tab */}
        {activeTab === 'giftcards' && user && (
          <div className="rounded-3xl bg-white/95 p-4 shadow-lg sm:p-6">
          <GiftCardManagement userId={user.uid} language={language} />
          </div>
        )}

        {/* Artist Dashboard Tab */}
        {activeTab === 'artist' && isArtist && user && (
          <div className="rounded-3xl bg-white/95 p-4 shadow-lg sm:p-6">
          <ArtistDashboard userId={user.uid} language={language} />
          </div>
        )}

        {/* Following Tab - Clean Vertical List */}
        {activeTab === 'following' && user && (
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 px-0 md:px-0">{t.followingArtists}</h2>
            
            {followingArtists.length === 0 ? (
              <div className="card p-6 md:p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 mx-0 md:mx-0">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
                  <FiUser className="text-4xl text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t.noFollowing}</h3>
                <p className="text-sm text-gray-600 mb-4">{t.startFollowing}</p>
                <button
                  onClick={() => handleNavClick('artworks')}
                  className="btn-primary flex items-center gap-2 mx-auto text-sm py-2.5 px-6"
                >
                  <FiArrowRight className="text-sm" />
                  {t.browseArtworks}
                </button>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3 px-0 md:px-0">
                {followingArtists.map((artist: any) => {
                  const isExpanded = expandedArtistId === artist.id
                  const artworks = artistArtworks[artist.id] || []
                  const isLoading = loadingArtworks[artist.id] || false

                  return (
                    <div key={artist.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Artist Card - Clickable */}
                      <button
                        onClick={() => handleArtistClick(artist.id)}
                        className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        {/* Avatar */}
                        {artist.profileImage ? (
                          <img
                            src={artist.profileImage}
                            alt={artist.artistName}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                            <FiUser className="text-gray-500 text-lg" />
                          </div>
                        )}
                        
                        {/* Artist Info */}
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{artist.artistName}</h3>
                          <p className="text-xs text-gray-500 truncate">{artist.email}</p>
                        </div>

                        {/* Expand/Collapse Icon */}
                        <div className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          <FiArrowRight className="text-gray-400 text-lg" />
                        </div>
                      </button>

                      {/* Expanded Artworks Section */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/50">
                          {isLoading ? (
                            <div className="p-6 text-center">
                              <div className="w-8 h-8 border-3 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-xs text-gray-500">{t.loadingArtworks}</p>
                            </div>
                          ) : artworks.length === 0 ? (
                            <div className="p-6 text-center">
                              <p className="text-sm text-gray-500">No artworks available</p>
                            </div>
                          ) : (
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {artworks.map((artwork: any) => (
                                  <div
                                    key={artwork.id}
                                    onClick={() => router.push(`/artwork/${artwork.id}`)}
                                    className="group bg-white rounded-lg border border-gray-200 p-2 md:p-3 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                                  >
                                    {artwork.images && artwork.images[0] ? (
                                      <div className="relative mb-2 h-32 md:h-40 w-full overflow-hidden rounded-lg bg-gray-100">
                                        <img
                                          src={artwork.images[0]}
                                          alt={artwork.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-full h-32 md:h-40 mb-2 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <span className="text-gray-400 text-[10px]">{t.noImage}</span>
                                      </div>
                                    )}
                                    <h4 className="font-semibold text-xs md:text-sm mb-1 line-clamp-1 text-gray-900">{artwork.title}</h4>
                                    <div className="flex items-center justify-between">
                                      <p className="text-gray-900 font-bold text-xs md:text-sm">₹{artwork.price}</p>
                                      <div className="flex items-center gap-1">
                                        <FiThumbsUp className={`text-xs ${artwork.likedBy?.includes(user?.uid) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                                        <span className="text-[10px] text-gray-500">{artwork.likes || 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* View Profile and Message Buttons */}
                              <div className="flex gap-2 pt-2 border-t border-gray-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/artist/${artist.id}`)
                                  }}
                                  className="flex-1 bg-white border border-gray-300 text-gray-700 rounded-lg py-2.5 text-xs md:text-sm font-semibold hover:bg-gray-50 transition-colors"
                                >
                                  {t.viewProfile}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/chat/${artist.userId}`)
                                  }}
                                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg py-2.5 text-xs md:text-sm font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                                >
                                  <FiMessageCircle className="text-sm" />
                                  {t.message}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Logout Confirmation Modal - Compact for Mobile */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-xs md:max-w-lg overflow-hidden rounded-xl md:rounded-3xl border border-white/40 bg-white/95 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.8)]">
            <div className="absolute -top-8 right-5 h-16 w-16 md:-top-16 md:right-10 md:h-32 md:w-32 rounded-full bg-orange-100 blur-2xl md:blur-3xl" />
            <div className="absolute -bottom-8 left-5 h-16 w-16 md:-bottom-16 md:left-10 md:h-32 md:w-32 rounded-full bg-pink-100 blur-2xl md:blur-3xl" />
            <div className="relative grid gap-3 md:gap-6 p-4 md:p-6 sm:p-8">
              <div className="flex items-center gap-2.5 md:gap-4">
                <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg shadow-gray-900/40">
                  <FiLogOut className="text-lg md:text-2xl" />
                </div>
                <div>
                  <p className="text-[9px] md:text-xs font-semibold uppercase tracking-wider md:tracking-[0.3em] text-gray-400">
                    {t.logout}
                  </p>
                  <h3 className="text-base md:text-2xl font-bold text-gray-900">{t.confirmLogout}</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-gray-600">
                {t.areYouSureLogout}
              </p>
              <div className="rounded-lg md:rounded-2xl border border-gray-100 bg-gray-50/60 p-2.5 md:p-4 text-xs md:text-sm text-gray-500">
                <p className="font-semibold text-gray-900 text-xs md:text-sm">{user?.email}</p>
                <p className="mt-0.5 md:mt-1 text-[10px] md:text-sm">
                  {language === 'hi'
                    ? 'आप पुनः लॉग इन करके कभी भी वापस आ सकते हैं।'
                    : 'You can sign back in at any time to continue exploring Peter Art.'}
                </p>
              </div>
              <div className="flex flex-col gap-2 md:gap-3 sm:flex-row">
              <button
                onClick={confirmLogout}
                  className="flex-1 rounded-lg md:rounded-2xl bg-gray-900 py-2 md:py-3 text-xs md:text-sm font-semibold text-white shadow-lg shadow-gray-900/40 transition hover:-translate-y-0.5 hover:bg-black"
              >
                {t.yesLogout}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-lg md:rounded-2xl border border-gray-200 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Order Tracking</h2>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <OrderTracking order={selectedOrderForTracking} language={language} />
          </div>
        </div>
      )}


      {/* Congratulations Modal - Artist Approved */}
      {showCongratulations && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowCongratulations(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="text-xl text-gray-600" />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <FiCheckCircle className="text-white text-5xl md:text-6xl" />
                </div>
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Congratulations Message */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {(t as any).congratulations}
              </h2>
              <h3 className="text-xl md:text-2xl font-semibold text-green-600">
                {(t as any).artistApproved}
              </h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                {(t as any).artistApprovedMessage}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => {
                  setShowCongratulations(false)
                  setActiveTab('artist')
                  setSidebarOpen(false)
                }}
                className="btn-primary flex-1 py-3 text-base font-semibold"
              >
                {(t as any).viewDashboard}
              </button>
              <button
                onClick={() => setShowCongratulations(false)}
                className="btn-secondary flex-1 py-3 text-base font-semibold"
              >
                {(t as any).close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
