'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getArtworkById } from '@/lib/artworks'
import { createOrder } from '@/lib/orders'
import { loadPopunderAd } from '@/lib/popunderAd'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiStar, FiImage, FiX, FiThumbsUp, FiTrash2, FiMessageCircle, FiChevronLeft, FiChevronRight, FiShare2, FiUser } from 'react-icons/fi'
import LoginModal from '@/components/LoginModal'
import Cart from '@/components/Cart'
import RecommendationSection from '@/components/RecommendationSection'
import ArtistBadge from '@/components/ArtistBadge'
import BannerAd from '@/components/BannerAd'
import { likeArtwork } from '@/lib/comments'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ArtworkDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { language } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [artwork, setArtwork] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India'
  })
  const [submitting, setSubmitting] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewImages, setReviewImages] = useState<File[]>([])
  const [reviewImagePreviews, setReviewImagePreviews] = useState<string[]>([])
  const [submittingReview, setSubmittingReview] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [liking, setLiking] = useState(false)
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({})
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({})
  const [submittingComment, setSubmittingComment] = useState<{ [key: string]: boolean }>({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [pinchStart, setPinchStart] = useState(0)
  const [initialScale, setInitialScale] = useState(1)
  const [lastTap, setLastTap] = useState(0)
  const [showDeleteReviewConfirm, setShowDeleteReviewConfirm] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [imageZoomed, setImageZoomed] = useState(false)
  const [imageScale, setImageScale] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [authPrompt, setAuthPrompt] = useState<{ open: boolean; message: string }>({
    open: false,
    message: ''
  })
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileModalImage, setProfileModalImage] = useState<string | null>(null)
  const [profileModalName, setProfileModalName] = useState<string>('')
  const [userProfileImages, setUserProfileImages] = useState<{ [key: string]: string | null }>({})

  const requireAuth = (message: string) => {
    setAuthPrompt({
      open: true,
      message: message || 'To complete this action you need to login first.'
    })
  }

  const handleAuthRedirect = () => {
    // Close prompt immediately for instant feedback
    setAuthPrompt({ open: false, message: '' })
    
    // Use window.location.href for instant navigation (faster than router.push)
    const next = typeof window !== 'undefined' ? window.location.pathname : '/'
    window.location.href = `/login?next=${encodeURIComponent(next)}`
  }

  const closeAuthPrompt = () => setAuthPrompt({ open: false, message: '' })

  // Prevent background scroll and fade mobile dock when auth prompt is open
  useEffect(() => {
    if (authPrompt.open) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('auth-prompt-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('auth-prompt-open')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('auth-prompt-open')
    }
  }, [authPrompt.open])

  useEffect(() => {
    checkAuth()
    loadArtwork()
  }, [params.id])

  // Load profile images for review authors
  useEffect(() => {
    if (artwork && artwork.comments) {
      const loadProfileImages = async () => {
        const profileMap: { [key: string]: string | null } = {}
        const uniqueUserIds = Array.from(new Set(artwork.comments.map((c: any) => c.userId))) as string[]
        
        await Promise.all(
          uniqueUserIds.map(async (userId: string) => {
            try {
              const response = await fetch(`/api/users/${userId}`)
              if (response.ok) {
                const userData = await response.json()
                profileMap[userId] = userData.profileImage || userData.photoURL || null
              }
            } catch (error) {
              console.error('Error loading user profile:', error)
              profileMap[userId] = null
            }
          })
        )
        
        setUserProfileImages(profileMap)
      }
      
      loadProfileImages()
    }
  }, [artwork])

  const checkAuth = async () => {
    try {
      // Add a small delay to ensure Firebase is initialized
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setFormData(prev => ({
          ...prev,
          email: currentUser.email || '',
          fullName: currentUser.displayName || currentUser.email?.split('@')[0] || ''
        }))
      }
      setAuthChecked(true)
    } catch (error) {
      console.error('Auth check error:', error)
      // Allow guest viewing
      setAuthChecked(true)
    }
  }

  const loadArtwork = async () => {
    try {
      const art = await getArtworkById(params.id as string)
      if (!art) {
        toast.error('Artwork not found')
        router.push('/user')
        return
      }
      setArtwork(art)
      setCurrentImageIndex(0) // Reset to first image when artwork loads
    } catch (error) {
      toast.error('Failed to load artwork')
      router.push('/user')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousImage = () => {
    if (!artwork || !artwork.images) return
    setCurrentImageIndex((prev) => (prev === 0 ? artwork.images.length - 1 : prev - 1))
    setImageZoomed(false)
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleNextImage = () => {
    if (!artwork || !artwork.images) return
    setCurrentImageIndex((prev) => (prev === artwork.images.length - 1 ? 0 : prev + 1))
    setImageZoomed(false)
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !imageZoomed) {
      setTouchStart(e.targetTouches[0].clientX)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !imageZoomed) {
      setTouchEnd(e.targetTouches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    if (imageZoomed) return
    
    // Handle double tap for mobile zoom
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTap
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      handleImageDoubleClick()
      setLastTap(0)
      return
    }
    
    setLastTap(currentTime)
    
    // Handle swipe for image navigation
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNextImage()
    }
    if (isRightSwipe) {
      handlePreviousImage()
    }
    
    setTouchStart(0)
    setTouchEnd(0)
  }

  const handleImageDoubleClick = () => {
    if (imageZoomed) {
      setImageZoomed(false)
      setImageScale(1)
      setImagePosition({ x: 0, y: 0 })
    } else {
      setImageZoomed(true)
      setImageScale(1.5) // Reduced from 2 to 1.5 for better initial zoom
    }
  }

  const handleImageWheel = (e: React.WheelEvent) => {
    if (!imageZoomed) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.min(Math.max(imageScale + delta, 1), 2.5) // Reduced max zoom from 4 to 2.5
    setImageScale(newScale)
    if (newScale === 1) {
      setImageZoomed(false)
      setImagePosition({ x: 0, y: 0 })
    }
  }

  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (!imageZoomed) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
  }

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageZoomed) return
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    
    // Constrain image position to prevent dragging too far
    // Calculate max bounds based on image scale
    const container = e.currentTarget.parentElement
    if (container) {
      const containerRect = container.getBoundingClientRect()
      const maxX = (containerRect.width * (imageScale - 1)) / 2
      const maxY = (containerRect.height * (imageScale - 1)) / 2
      
      setImagePosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      })
    } else {
      setImagePosition({ x: newX, y: newY })
    }
  }

  const handleImageMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchPinch = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      if (pinchStart === 0) {
        setPinchStart(distance)
        setInitialScale(imageScale || 1)
        return
      }
      
      const scale = distance / pinchStart
      const newScale = Math.min(Math.max(initialScale * scale, 1), 2.5) // Reduced max zoom from 4 to 2.5
      setImageScale(newScale)
      setImageZoomed(newScale > 1.1) // Only set zoomed if scale is significantly above 1
      
      if (newScale <= 1.1) {
        setImagePosition({ x: 0, y: 0 })
        setImageZoomed(false)
      }
    } else {
      setPinchStart(0)
      setInitialScale(1)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const shareData = {
      title: artwork?.title || 'Peter Art - Artwork',
      text: artwork?.description || 'Check out this artwork',
      url: url
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast.success('Shared successfully!')
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        // Try clipboard as fallback
        try {
          await navigator.clipboard.writeText(url)
          toast.success('Link copied to clipboard!')
        } catch (clipboardError) {
          toast.error('Failed to share')
        }
      }
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= 5) {
      setQuantity(newQuantity)
    }
  }

  const handleBuyNow = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!user || !user.uid) {
      requireAuth('To purchase artworks, you need to login first.')
      return
    }
    
    if (!artwork) {
      toast.error('Artwork not loaded')
      return
    }
    
    setShowCheckout(true)
  }

  const handleReviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + reviewImages.length > 3) {
      toast.error('Maximum 3 images allowed')
      return
    }
    setReviewImages([...reviewImages, ...files])
    files.forEach((file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setReviewImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeReviewImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index))
    setReviewImagePreviews(reviewImagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reviewText.trim()) {
      toast.error('Please enter your review')
      return
    }
    if (reviewRating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmittingReview(true)
    try {
      const formData = new FormData()
      formData.append('artworkId', artwork.id)
      formData.append('userId', user?.uid || `guest_${Date.now()}`)
      formData.append('userName', user?.displayName || user?.email?.split('@')[0] || 'Guest User')
      formData.append('userEmail', user?.email || '')
      formData.append('text', reviewText)
      formData.append('rating', reviewRating.toString())
      
      reviewImages.forEach((image) => {
        formData.append('images', image)
      })

      const response = await fetch('/api/artworks/comments', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      toast.success('Review submitted successfully!')
      setReviewText('')
      setReviewRating(0)
      setReviewImages([])
      setReviewImagePreviews([])
      loadArtwork()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleLoginSuccess = async (loggedInUser: any) => {
    setUser(loggedInUser)
    setLoginModalOpen(false)
    setFormData(prev => ({
      ...prev,
      email: loggedInUser.email || '',
      fullName: loggedInUser.displayName || loggedInUser.email?.split('@')[0] || ''
    }))
  }

  const handleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!user || !user.uid) {
      requireAuth('To like artworks, you need to login first.')
      return
    }

    if (!artwork || !artwork.id) {
      toast.error('Artwork not loaded')
      return
    }

    if (liking) {
      return // Prevent multiple clicks
    }

    setLiking(true)
    try {
      const wasLiked = artwork.likedBy?.includes(user.uid) || false
      await likeArtwork(artwork.id, user.uid)
      // Update artwork state optimistically
      setArtwork((prev: any) => {
        if (!prev) return prev
        const newLikedBy = prev.likedBy || []
        const isLiked = newLikedBy.includes(user.uid)
        return {
          ...prev,
          likedBy: isLiked 
            ? newLikedBy.filter((id: string) => id !== user.uid)
            : [...newLikedBy, user.uid],
          likes: (prev.likes || 0) + (isLiked ? -1 : 1)
        }
      })
      toast.success(wasLiked ? 'Removed like' : 'Liked artwork')
    } catch (error: any) {
      console.error('Like error:', error)
      toast.error(error.message || 'Failed to like artwork')
      // Reload artwork on error to sync state
      await loadArtwork()
    } finally {
      setLiking(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!user || !artwork || !reviewToDelete) return

    try {
      const response = await fetch(`/api/artworks/comments?artworkId=${artwork.id}&commentId=${reviewToDelete}&userId=${user.uid}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      toast.success('Review deleted successfully')
      setShowDeleteReviewConfirm(false)
      setReviewToDelete(null)
      await loadArtwork()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review')
    }
  }

  const confirmDeleteReview = (commentId: string) => {
    setReviewToDelete(commentId)
    setShowDeleteReviewConfirm(true)
  }

  const handleLikeReview = async (commentId: string) => {
    if (!user || !user.uid) {
      requireAuth('To like this review you need to login first.')
      return
    }

    if (!artwork) return

    try {
      const response = await fetch('/api/artworks/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId: artwork.id, userId: user.uid, commentId })
      })

      if (!response.ok) {
        throw new Error('Failed to like review')
      }

      await loadArtwork()
    } catch (error: any) {
      toast.error(error.message || 'Failed to like review')
    }
  }

  const handleCommentOnReview = async (commentId: string) => {
    if (!user || !user.uid) {
      requireAuth('To comment on reviews you need to login first.')
      toast.error('Please sign in to comment on reviews')
      return
    }

    const text = commentTexts[commentId]?.trim()
    if (!text) {
      toast.error('Please enter a comment')
      return
    }

    if (!artwork) return

    setSubmittingComment({ ...submittingComment, [commentId]: true })
    try {
      const formData = new FormData()
      formData.append('artworkId', artwork.id)
      formData.append('userId', user.uid)
      formData.append('userName', user.displayName || user.email?.split('@')[0] || 'User')
      formData.append('userEmail', user.email || '')
      formData.append('text', text)
      formData.append('parentCommentId', commentId)

      const response = await fetch('/api/artworks/comments', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      toast.success('Comment added successfully')
      setCommentTexts({ ...commentTexts, [commentId]: '' })
      setExpandedComments({ ...expandedComments, [commentId]: false })
      await loadArtwork()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment')
    } finally {
      setSubmittingComment({ ...submittingComment, [commentId]: false })
    }
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if online payment is selected
    if (paymentMethod === 'online') {
      toast('Online payment feature coming soon!', { 
        icon: 'ℹ️',
        duration: 3000
      })
      return
    }
    
    setSubmitting(true)

    try {
      if (paymentMethod === 'cod') {
        // Validate COD form fields
        if (!formData.fullName || !formData.phone || !formData.address1 || !formData.pincode || !formData.city) {
          toast.error('Please fill in all required fields')
          setSubmitting(false)
          return
        }
      }

      const totalPrice = (artwork.price * quantity).toFixed(2)

      await createOrder({
        userId: user.uid,
        userEmail: user.email,
        userName: formData.fullName || user.displayName || user.email.split('@')[0],
        artworkId: artwork.id,
        artworkTitle: artwork.title,
        artworkImage: artwork.images?.[0],
        quantity: quantity,
        unitPrice: artwork.price,
        total: parseFloat(totalPrice),
        paymentMethod: paymentMethod,
        // COD Details
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address1: formData.address1,
        address2: formData.address2,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        country: formData.country
      })

      toast.success('Order placed successfully!')
      // Load popunder ad after successful order (only triggers once per session)
      loadPopunderAd('order')
      setTimeout(() => {
        router.push('/user?tab=orders')
      }, 1000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-sm md:text-base">Loading artwork...</p>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return null
  }

  const totalPrice = (artwork.price * quantity).toFixed(2)

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Top Bar - Mobile Optimized */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-3 py-3 md:px-4 md:py-4">
        <div className="flex justify-between items-center w-full md:max-w-6xl md:mx-auto">
          <button
            onClick={() => router.push('/user')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm md:text-base font-semibold text-gray-700 hover:bg-gray-100 transition-all"
          >
            <FiArrowLeft className="text-lg" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <Cart />
        </div>
      </div>

      <div className="w-full md:max-w-6xl md:mx-auto md:px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Artwork Images */}
          <div className="space-y-3 md:space-y-4">
            {artwork.images && artwork.images.length > 0 ? (
              <>
                <div className="bg-white rounded-none md:rounded-2xl overflow-hidden">
                  <div 
                  className={`relative w-full h-[70vh] sm:h-[75vh] md:h-96 rounded-none md:rounded-xl bg-gray-50 flex items-center justify-center ${imageZoomed ? 'overflow-hidden cursor-move touch-none' : 'overflow-hidden'}`}
                  onTouchStart={(e) => {
                    if (e.touches.length === 2) {
                      e.preventDefault()
                      handleTouchPinch(e)
                    } else if (e.touches.length === 1 && !imageZoomed) {
                      handleTouchStart(e)
                    } else if (e.touches.length === 1 && imageZoomed) {
                      // Start dragging when zoomed
                      const touch = e.touches[0]
                      setIsDragging(true)
                      setDragStart({ x: touch.clientX - imagePosition.x, y: touch.clientY - imagePosition.y })
                    }
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length === 2) {
                      e.preventDefault()
                      handleTouchPinch(e)
                    } else if (e.touches.length === 1 && imageZoomed && isDragging) {
                      e.preventDefault()
                      const touch = e.touches[0]
                      const newX = touch.clientX - dragStart.x
                      const newY = touch.clientY - dragStart.y
                      
                      // Constrain position
                      const container = e.currentTarget
                      const containerRect = container.getBoundingClientRect()
                      const maxX = (containerRect.width * (imageScale - 1)) / 2
                      const maxY = (containerRect.height * (imageScale - 1)) / 2
                      
                      setImagePosition({
                        x: Math.max(-maxX, Math.min(maxX, newX)),
                        y: Math.max(-maxY, Math.min(maxY, newY))
                      })
                    } else if (e.touches.length === 1 && !imageZoomed) {
                      handleTouchMove(e)
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (e.touches.length === 0) {
                      setPinchStart(0)
                      setIsDragging(false)
                      handleTouchEnd()
                    } else if (e.touches.length === 1) {
                      setIsDragging(false)
                    }
                  }}
                  onWheel={handleImageWheel}
                  onMouseDown={handleImageMouseDown}
                  onMouseMove={handleImageMouseMove}
                  onMouseUp={handleImageMouseUp}
                  onMouseLeave={handleImageMouseUp}
                >
                  <img
                    src={artwork.images[currentImageIndex]}
                    alt={`${artwork.title} ${currentImageIndex + 1}`}
                    className={`select-none transition-transform duration-200 ${imageZoomed ? 'cursor-move' : 'cursor-zoom-in'}`}
                    style={{
                      transform: `scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${imagePosition.y / imageScale}px)`,
                      transformOrigin: 'center center',
                      maxWidth: imageZoomed ? 'none' : '100%',
                      maxHeight: imageZoomed ? 'none' : '100%',
                      width: imageZoomed ? 'auto' : '100%',
                      height: imageZoomed ? 'auto' : '100%',
                      objectFit: 'contain',
                      willChange: imageZoomed ? 'transform' : 'auto'
                    }}
                    draggable={false}
                    onDoubleClick={handleImageDoubleClick}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  {!imageZoomed && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm">
                      Double tap or pinch to zoom
                    </div>
                  )}
                  {imageZoomed && (
                    <button
                      onClick={() => {
                        setImageZoomed(false)
                        setImageScale(1)
                        setImagePosition({ x: 0, y: 0 })
                      }}
                      className="absolute top-4 left-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-2.5 transition-all z-20 backdrop-blur-sm"
                      aria-label="Close zoom"
                    >
                      <FiX className="text-lg" />
                    </button>
                  )}
                  
                  {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
                  {artwork.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all z-10 items-center justify-center"
                        aria-label="Previous image"
                      >
                        <FiChevronLeft className="text-xl" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all z-10 items-center justify-center"
                        aria-label="Next image"
                      >
                        <FiChevronRight className="text-xl" />
                      </button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {artwork.images.map((_img: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentImageIndex(idx)
                              setImageZoomed(false)
                              setImageScale(1)
                              setImagePosition({ x: 0, y: 0 })
                            }}
                            className={`h-2 rounded-full transition-all ${
                              idx === currentImageIndex
                                ? 'w-6 bg-white'
                                : 'w-2 bg-white bg-opacity-50 hover:bg-opacity-75'
                            }`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Share Button - Desktop */}
                  <button
                    onClick={handleShare}
                    className="hidden md:flex absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2.5 transition-all z-20 backdrop-blur-sm shadow-lg"
                    aria-label="Share artwork"
                    title="Share this artwork"
                  >
                    <FiShare2 className="text-lg" />
                  </button>
                </div>
                {/* Share Button - Mobile (placed below image for clean view) */}
                <div className="flex justify-end md:hidden px-2 mt-2">
                  <button
                    onClick={handleShare}
                    className="bg-black text-white rounded-full px-3 py-2 shadow-md flex items-center gap-2"
                    aria-label="Share artwork on mobile"
                    title="Share this artwork"
                  >
                    <FiShare2 className="text-base" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="card p-4">
                <div className="relative w-full h-96 rounded-lg overflow-hidden mb-4 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              </div>
            )}
          </div>

          {/* Artwork Details */}
          <div className="space-y-4 md:space-y-6 px-3 md:px-0">
            <div className="bg-white rounded-none md:rounded-2xl p-3 md:p-6 lg:p-8">
              <div className="flex items-start justify-between mb-2 md:mb-4">
                <div className="flex-1 min-w-0">
                  {artwork.artistId && (
                    <div className="mb-2 md:mb-3">
                      <ArtistBadge artistId={artwork.artistId} />
                    </div>
                  )}
                  <h1 className="text-base md:text-2xl lg:text-3xl font-bold mb-1.5 md:mb-3 text-gray-900 leading-tight">{artwork.title}</h1>
                  <p className="text-xs md:text-base text-gray-600 mb-2 md:mb-4 whitespace-pre-wrap leading-relaxed">{artwork.description}</p>
                </div>
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center gap-1 px-2 py-2 rounded-lg transition-colors flex-shrink-0 ml-2 ${
                    artwork.likedBy?.includes(user?.uid)
                      ? 'bg-red-50 text-red-600'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  } ${liking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiThumbsUp className={`text-base ${artwork.likedBy?.includes(user?.uid) ? 'fill-current text-red-500' : ''}`} />
                  <span className="text-xs font-medium hidden sm:inline">{artwork.likes || 0}</span>
                </button>
              </div>
              {artwork.category && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] md:text-sm font-semibold mb-2 md:mb-4">
                  {artwork.category}
                </span>
              )}
              <div className="border-t border-gray-200 pt-3 md:pt-6 mt-3 md:mt-6">
                <div className="flex items-center justify-between mb-3 md:mb-6">
                  <p className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900">₹{artwork.price}</p>
                </div>

                {!showCheckout ? (
                  <>
                    {/* Quantity Selector */}
                    <div className="mb-3 md:mb-6">
                      <label className="block text-[10px] md:text-sm font-semibold mb-1.5 md:mb-3 text-gray-700">
                        Quantity (Max 5)
                      </label>
                      <div className="flex items-center gap-3 md:gap-4">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border-2 border-gray-300 bg-white text-gray-900 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 hover:bg-gray-50 transition-all"
                        >
                          <FiMinus className="text-lg md:text-xl" />
                        </button>
                        <span className="text-xl md:text-2xl font-bold w-8 md:w-12 text-center text-gray-900">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= 5}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border-2 border-gray-300 bg-white text-gray-900 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 hover:bg-gray-50 transition-all"
                        >
                          <FiPlus className="text-lg md:text-xl" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3 md:mb-6 p-2 md:p-5 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200">
                      <div className="flex justify-between items-center mb-1 md:mb-2">
                        <span className="text-gray-700 text-[10px] md:text-base font-medium">Total Price:</span>
                        <span className="text-lg md:text-2xl font-bold text-gray-900">₹{totalPrice}</span>
                      </div>
                      <p className="text-[10px] md:text-sm text-gray-600">
                        <span className="font-medium">{quantity} × ₹{artwork.price} = ₹{totalPrice}</span>
                      </p>
                    </div>

                    <div className="flex gap-2 md:gap-3">
                      <button
                        onClick={() => {
                          if (!user) {
                            requireAuth('To add items to cart you need to login first.')
                            return
                          }
                          addToCart({
                            artworkId: artwork.id,
                            artworkTitle: artwork.title,
                            artworkImage: artwork.images?.[0] || '',
                            unitPrice: artwork.price,
                            quantity: quantity
                          })
                          toast.success('Added to cart!')
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs md:text-base py-2.5 md:py-4 rounded-lg md:rounded-xl font-semibold bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 transition-all"
                      >
                        <FiShoppingCart className="text-sm md:text-lg" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Cart</span>
                      </button>
                      <button
                        onClick={handleBuyNow}
                        type="button"
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs md:text-base py-2.5 md:py-4 rounded-lg md:rounded-xl font-bold bg-black text-white hover:bg-gray-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiShoppingCart className="text-sm md:text-lg" />
                        Buy Now
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Checkout</h3>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-600">
                        Payment Method *
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                          <input
                            type="radio"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span>Cash on Delivery</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                          <input
                            type="radio"
                            value="online"
                            checked={paymentMethod === 'online'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span>Online Payment</span>
                        </label>
                      </div>
                    </div>

                    {paymentMethod === 'cod' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input-field"
                            placeholder="+91 1234567890"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            value={formData.address1}
                            onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                            className="input-field"
                            placeholder="Street address, house number"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={formData.address2}
                            onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                            className="input-field"
                            placeholder="Apartment, suite, etc. (optional)"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              value={formData.pincode}
                              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                              className="input-field"
                              placeholder="123456"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              City *
                            </label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              State
                            </label>
                            <input
                              type="text"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              Country
                            </label>
                            <input
                              type="text"
                              value={formData.country}
                              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                              className="input-field"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Quantity:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Unit Price:</span>
                        <span className="font-medium text-orange-600">₹{artwork.price}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold">Total:</span>
                          <span className="text-base font-bold text-orange-600">₹{totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-black text-white py-3 md:py-4 rounded-lg md:rounded-xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50"
                      >
                        {submitting ? 'Placing Order...' : 'Confirm Order'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCheckout(false)}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-900 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-none md:rounded-2xl p-4 md:p-6 lg:p-8 mt-4 md:mt-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 text-gray-900">
                Reviews
              </h2>
              
              {/* Average Rating */}
              {artwork.averageRating && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-gray-900">{artwork.averageRating}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`text-lg ${
                            star <= Math.round(parseFloat(artwork.averageRating))
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({artwork.totalRatings || artwork.comments?.filter((c: any) => c.rating)?.length || 0} {artwork.totalRatings === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>
              )}

              {/* Review Form - Available to Everyone */}
              {authChecked && (
                <form onSubmit={handleSubmitReview} className="mb-6 pb-6 border-b border-gray-200">
                  <div className="mb-3">
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Rating *</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <FiStar
                            className={`text-xl transition-colors ${
                              star <= reviewRating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Your Review *</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="input-field text-xs min-h-[80px]"
                      placeholder="Share your experience with this artwork..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Add Photos (Optional, max 3)</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleReviewImageChange}
                          className="hidden"
                          disabled={reviewImages.length >= 3}
                        />
                        <span className="btn-secondary text-xs py-2 px-3 flex items-center gap-1">
                          <FiImage className="text-xs" />
                          Add Photos
                        </span>
                      </label>
                      {reviewImages.length > 0 && (
                        <span className="text-xs text-gray-500">{reviewImages.length}/3</span>
                      )}
                    </div>
                    {reviewImagePreviews.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {reviewImagePreviews.map((preview, index) => (
                          <div key={index} className="relative w-20 h-20 rounded overflow-hidden">
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeReviewImage(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              <FiX className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-black text-white text-xs md:text-sm py-2.5 px-4 md:px-6 rounded-lg font-semibold hover:bg-gray-900 transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {artwork.comments && artwork.comments.length > 0 ? (
                  artwork.comments
                    .filter((comment: any) => comment.rating || comment.text)
                    .map((comment: any) => (
                      <div key={comment.id} className="pb-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-3 mb-2">
                          {/* Profile Image */}
                          <div 
                            className="flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              const profileImage = userProfileImages[comment.userId]
                              if (profileImage) {
                                setProfileModalImage(profileImage)
                                setProfileModalName(comment.userName)
                                setShowProfileModal(true)
                              }
                            }}
                          >
                            {userProfileImages[comment.userId] ? (
                              <img
                                src={userProfileImages[comment.userId]!}
                                alt={comment.userName}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                                <span className="text-white text-xs md:text-sm font-bold">
                                  {comment.userName[0]?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium text-gray-900">{comment.userName}</p>
                                {comment.rating && (
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FiStar
                                        key={star}
                                        className={`text-xs ${
                                          star <= comment.rating
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              {user && user.uid === comment.userId && (
                                <button
                                  onClick={() => confirmDeleteReview(comment.id)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                  title="Delete review"
                                >
                                  <FiTrash2 className="text-xs" />
                                </button>
                              )}
                            </div>
                            {comment.text && (
                              <p className="text-xs text-gray-600 mb-2">{comment.text}</p>
                            )}
                            {comment.images && comment.images.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {comment.images.map((img: string, idx: number) => (
                                  <div key={idx} className="w-16 h-16 rounded overflow-hidden">
                                    <img src={img} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1 mb-2">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                            
                            {/* Like and Comment buttons */}
                            <div className="flex items-center gap-4 mt-2">
                              <button
                                onClick={() => handleLikeReview(comment.id)}
                                disabled={!user}
                                className={`flex items-center gap-1 text-xs ${
                                  comment.likedBy?.includes(user?.uid)
                                    ? 'text-gray-900 font-medium'
                                    : 'text-gray-500 hover:text-gray-700'
                                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <FiThumbsUp className={`text-xs ${comment.likedBy?.includes(user?.uid) ? 'fill-current' : ''}`} />
                                <span>{comment.likes || 0}</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (!user) {
                                    requireAuth('To comment on reviews you need to login first.')
                                    return
                                  }
                                  setExpandedComments({ ...expandedComments, [comment.id]: !expandedComments[comment.id] })
                                }}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                              >
                                <FiMessageCircle className="text-xs" />
                                <span>{comment.replies?.length || 0}</span>
                              </button>
                            </div>

                            {/* Comment form */}
                            {expandedComments[comment.id] && user && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <textarea
                                  value={commentTexts[comment.id] || ''}
                                  onChange={(e) => setCommentTexts({ ...commentTexts, [comment.id]: e.target.value })}
                                  placeholder="Write a comment..."
                                  className="input-field text-xs min-h-[60px] mb-2"
                                />
                                <button
                                  onClick={() => handleCommentOnReview(comment.id)}
                                  disabled={submittingComment[comment.id] || !commentTexts[comment.id]?.trim()}
                                  className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
                                >
                                  {submittingComment[comment.id] ? 'Posting...' : 'Post Comment'}
                                </button>
                              </div>
                            )}

                            {/* Replies/Comments on review */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                {comment.replies.map((reply: any) => (
                                  <div key={reply.id} className="pl-3 border-l-2 border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-xs font-medium text-gray-900">{reply.userName}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600">{reply.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {authPrompt.open && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4" 
          style={{ 
            backdropFilter: 'blur(8px)', 
            backgroundColor: 'rgba(0, 0, 0, 0.7)', 
            transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 relative z-10" style={{ margin: 'auto' }}>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">Login required</p>
              <p className="text-sm text-gray-600">
                {authPrompt.message || 'To complete this action you need to login first.'}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeAuthPrompt}
                className="btn-secondary px-4 py-2 text-sm font-semibold"
              >
                Not now
              </button>
              <button
                onClick={handleAuthRedirect}
                className="bg-black text-white hover:bg-gray-800 px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              >
                Go to login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Delete Review Confirmation Modal */}
      {showDeleteReviewConfirm && (
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
            className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1
            }}
            onClick={() => {
              setShowDeleteReviewConfirm(false)
              setReviewToDelete(null)
            }}
          />
          
          {/* Modal content */}
          <div 
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full border-2 border-gray-200 relative z-10"
            style={{ 
              position: 'relative',
              zIndex: 10,
              margin: 'auto',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this review? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteReview}
                className="btn-primary flex-1"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteReviewConfirm(false)
                  setReviewToDelete(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Image Modal */}
      {showProfileModal && profileModalImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 md:p-4 transition-all shadow-lg"
              aria-label="Close"
            >
              <FiX className="text-xl md:text-2xl" />
            </button>
            
            {/* Large Image */}
            <div className="text-center">
              <img
                src={profileModalImage}
                alt={profileModalName}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
                }}
              />
              <p className="mt-4 text-white text-lg font-semibold">{profileModalName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Banner Ad before Similar Artworks */}
      <div className="w-full md:max-w-6xl md:mx-auto md:px-4 py-4 md:py-6">
        <BannerAd inline={true} />
      </div>

      {/* Similar Artworks Section */}
      {artwork && (
        <div className="w-full md:max-w-6xl md:mx-auto md:px-4">
          <RecommendationSection
            type="similar"
            artworkId={artwork.id}
            title="Similar Artworks"
            subtitle="You might also like these"
            limit={6}
            language={language}
          />
        </div>
      )}
    </div>
  )
}

