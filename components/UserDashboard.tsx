'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllArtworks, searchArtworks } from '@/lib/artworks'
import { getUserOrders, createOrder, cancelOrder, returnOrder } from '@/lib/orders'
import { getUserWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist'
import { addComment, likeArtwork, isLiked } from '@/lib/comments'
import { logout } from '@/lib/auth'
import { loadPopunderAd, resetPopunderAd } from '@/lib/popunderAd'
import toast from 'react-hot-toast'
import { FiSearch, FiHeart, FiShoppingCart, FiShare2, FiMessageCircle, FiThumbsUp, FiHelpCircle, FiMenu, FiX, FiSettings, FiLogOut, FiUser, FiStar, FiPackage, FiTrendingUp, FiCalendar, FiDollarSign, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null)
  const [isArtist, setIsArtist] = useState(false)
  const [artistProfile, setArtistProfile] = useState<any>(null)
  const [previousArtistStatus, setPreviousArtistStatus] = useState<string | null>(null)
  const [showCongratulations, setShowCongratulations] = useState(false)
  const [followingArtists, setFollowingArtists] = useState<any[]>([])

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

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [sidebarOpen])

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

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-2 py-2 flex items-center justify-between relative">
        {/* Hamburger Menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Center - Peter Art */}
        <h1 className="text-lg font-bold text-gray-900">{t.peterArt}</h1>

        {/* Right Side - Cart and User Icon */}
        <div className="flex items-center gap-2">
          <Cart />
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
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {/* Backdrop with fade effect */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[100] transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            style={{ backdropFilter: 'blur(3px)' }}
          ></div>
          
          {/* Sidebar with slide-in animation */}
          <div className="fixed left-0 top-0 h-full w-64 md:w-72 bg-white shadow-2xl z-[101] overflow-y-auto animate-slideInLeft">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiMenu className="text-orange-600" />
                {t.menu}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <nav className="py-4">
              <button
                onClick={() => handleNavClick('artworks')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'artworks'
                    ? 'bg-gradient-to-r from-orange-50 to-white text-gray-900 border-l-4 border-orange-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                {t.artworks}
              </button>
              <button
                onClick={() => handleNavClick('wishlist')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'wishlist'
                    ? 'bg-gradient-to-r from-orange-50 to-white text-gray-900 border-l-4 border-orange-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                {t.wishlist}
              </button>
              {user && (
                <button
                  onClick={() => handleNavClick('following')}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'following'
                      ? 'bg-gradient-to-r from-orange-50 to-white text-gray-900 border-l-4 border-orange-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                  }`}
                >
                  {t.following}
                </button>
              )}
              <button
                onClick={() => handleNavClick('orders')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-orange-50 to-white text-gray-900 border-l-4 border-orange-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                {t.myOrders}
              </button>
              <button
                onClick={() => handleNavClick('reviews')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'reviews'
                    ? 'bg-gradient-to-r from-orange-50 to-white text-gray-900 border-l-4 border-orange-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                {t.myReviews}
              </button>
              <button
                onClick={() => handleNavClick('support')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'support'
                    ? 'bg-gradient-to-r from-orange-50 to-white text-gray-900 border-l-4 border-orange-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                {t.helpSupport}
              </button>
              {user && (
                <>
                  <button
                    onClick={() => handleNavClick('profile')}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      activeTab === 'profile'
                        ? 'bg-gradient-to-r from-orange-50 to-white text-gray-900 border-l-4 border-orange-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                    }`}
                  >
                    {t.myProfile}
                  </button>
                  <button
                    onClick={() => handleNavClick('giftcards')}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      activeTab === 'giftcards'
                        ? 'bg-gradient-to-r from-orange-50 to-white text-gray-900 border-l-4 border-orange-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                    }`}
                  >
                    {t.myGiftCards}
                  </button>
                  <button
                    onClick={() => router.push('/messages')}
                    className="w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300"
                  >
                    <FiMessageCircle className="inline mr-2 text-base" />
                    {language === 'hi' ? 'संदेश' : 'Messages'}
                  </button>
                </>
              )}
              {isArtist && user && (
                <button
                  onClick={() => handleNavClick('artist')}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'artist'
                      ? 'bg-gradient-to-r from-orange-50 to-white text-gray-900 border-l-4 border-orange-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                  }`}
                >
                  <FiTrendingUp className="inline mr-2 text-base" />
                  {t.artistDashboard}
                </button>
              )}
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
      <div className={sidebarOpen ? 'pointer-events-none' : ''}>
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

        {/* Advanced Search and Filters - Only show on artworks tab */}
        {activeTab === 'artworks' && (
          <div className="mb-4">
            <SearchFilters
              artworks={artworks}
              onFilterChange={setFilteredArtworks}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              language={language}
              filteredCount={filteredArtworks.length}
            />
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
                    {artwork.artistId && (
                      <div className="mb-1">
                        <ArtistBadge artistId={artwork.artistId} className="text-xs" />
                      </div>
                    )}
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

               {/* Recommendations Section - Show after main artworks */}
               {filteredArtworks.length > 0 && (
                 <>
                   {user ? (
                     <>
                       <RecommendationSection
                         userId={user.uid}
                         type="personalized"
                         limit={8}
                         language={language}
                       />
                       <RecommendationSection
                         userId={user.uid}
                         type="becauseYouLiked"
                         limit={6}
                         language={language}
                       />
                     </>
                   ) : (
                     <RecommendationSection
                       type="trending"
                       limit={8}
                       language={language}
                     />
                   )}
                 </>
               )}
             </div>
           )}

           {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
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
                  <div className="text-2xl md:text-3xl font-bold text-orange-600">{wishlist.length}</div>
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
                        <p className="text-gray-900 font-bold text-base md:text-lg">₹{artwork.price}</p>
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
          <div className="space-y-4">
            {/* Header with Statistics */}
            <div className="card p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                  <FiShoppingCart className="text-2xl text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">{t.myOrders}</h2>
                  <p className="text-xs md:text-sm text-gray-600">
                    {orders.length} {orders.length === 1 ? t.myOrders.slice(0, -1) : t.myOrders} placed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-xs text-gray-500">{t.totalOrders}</div>
                </div>
              </div>
              {orders.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-100">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {orders.filter((o: any) => o.status === 'delivered').length}
                    </div>
                    <div className="text-xs text-gray-600">{t.delivered}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">
                      {orders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length}
                    </div>
                    <div className="text-xs text-gray-600">{t.pending}</div>
                  </div>
                </div>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="card p-6 md:p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-4">
                  <FiShoppingCart className="text-4xl text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t.noOrdersYet}</h3>
                <p className="text-sm text-gray-600 mb-4">{t.noOrders}</p>
                <button
                  onClick={() => handleNavClick('artworks')}
                  className="btn-primary flex items-center gap-2 mx-auto text-sm py-2.5 px-6"
                >
                  <FiArrowRight className="text-sm" />
                  {t.startShopping}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => {
                  const canCancel = canCancelOrder(order)
                  const canReturn = canReturnOrder(order)
                  const orderDate = new Date(order.createdAt)
                  return (
                  <div 
                    key={order.id} 
                      className="card p-3 md:p-4 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                  >
                      <div className="flex gap-3 md:gap-4">
                    {order.artworkImage ? (
                          <div 
                            className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
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
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                            <FiPackage className="text-2xl text-gray-400" />
                      </div>
                    )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 
                                className="font-bold text-sm md:text-base mb-1 line-clamp-1 cursor-pointer hover:text-blue-600"
                                onClick={() => order.artworkId && router.push(`/artwork/${order.artworkId}`)}
                              >
                                {order.artworkTitle}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                                <span className="flex items-center gap-1">
                                  <FiCalendar className="text-xs" />
                                  {orderDate.toLocaleDateString()}
                                </span>
                                <span className="hidden md:inline">•</span>
                                <span className="hidden md:inline">#{order.id.slice(0, 8)}</span>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${
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
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-gray-600">
                              {t.quantity}: <span className="font-semibold">{order.quantity || 1}</span> × ₹{order.unitPrice || order.total}
              </div>
                            <div className="flex items-center gap-1 text-base md:text-lg font-bold text-gray-900">
                              <FiDollarSign className="text-sm" />
                              ₹{order.total}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {canCancel && (
                              <button
                                onClick={(e) => handleCancelOrder(order.id, e)}
                                className="flex-1 text-xs md:text-sm py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                              >
                                {t.cancelOrder}
                              </button>
                            )}
                            {canReturn && (
                              <button
                                onClick={(e) => handleReturnOrder(order.id, e)}
                                className="flex-1 text-xs md:text-sm py-2 px-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                              >
                                {t.returnOrder}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrderForTracking(order)}
                              className="text-xs md:text-sm py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-1"
                            >
                              <FiPackage className="text-xs" />
                              Track Order
                            </button>
                            <button
                              onClick={() => order.artworkId && router.push(`/artwork/${order.artworkId}`)}
                              className={`text-xs md:text-sm py-2 px-3 btn-secondary font-semibold flex items-center justify-center gap-1 ${canCancel || canReturn ? 'flex-1' : 'w-full'}`}
                            >
                              {t.viewDetails}
                              <FiArrowRight className="text-xs" />
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
          <div className="space-y-4">
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
          <div>
            <HelpSupport user={user} language={language} />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <UserProfile user={user} onProfileUpdate={onUserUpdate} language={language} />
          </div>
        )}

        {/* Gift Cards Tab */}
        {activeTab === 'giftcards' && user && (
          <GiftCardManagement userId={user.uid} language={language} />
        )}

        {/* Artist Dashboard Tab */}
        {activeTab === 'artist' && isArtist && user && (
          <ArtistDashboard userId={user.uid} language={language} />
        )}

        {/* Following Tab */}
        {activeTab === 'following' && user && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.followingArtists}</h2>
            
            {followingArtists.length === 0 ? (
              <div className="card p-6 md:p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
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
              <>
                {/* Artists List */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {followingArtists.map((artist: any) => (
                    <div key={artist.id} className="card p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {artist.profileImage ? (
                          <img
                            src={artist.profileImage}
                            alt={artist.artistName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <FiUser className="text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{artist.artistName}</h3>
                          <p className="text-xs text-gray-500 truncate">{artist.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/artist/${artist.id}`)}
                          className="btn-secondary flex-1 text-xs py-2"
                        >
                          {t.viewProfile}
                        </button>
                        <button
                          onClick={() => router.push(`/chat/${artist.userId}`)}
                          className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1"
                        >
                          <FiMessageCircle className="text-xs" />
                          {t.message}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Artworks from Following */}
                <div className="card p-4 md:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{t.artworksFromFollowing}</h3>
                  <ArtistFeed userId={user.uid} language={language} />
                </div>
              </>
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
            <h3 className="text-xl font-bold mb-4 text-gray-900">{t.confirmLogout}</h3>
            <p className="text-gray-600 mb-6">{t.areYouSureLogout}</p>
            <div className="flex gap-4">
              <button
                onClick={confirmLogout}
                className="btn-primary flex-1"
              >
                {t.yesLogout}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-secondary flex-1"
              >
                {t.cancel}
              </button>
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
