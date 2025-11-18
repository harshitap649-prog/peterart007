'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getArtworkById } from '@/lib/artworks'
import { createOrder } from '@/lib/orders'
import { loadPopunderAd } from '@/lib/popunderAd'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiStar, FiImage, FiX, FiThumbsUp, FiTrash2, FiMessageCircle, FiChevronLeft, FiChevronRight, FiShare2 } from 'react-icons/fi'
import LoginModal from '@/components/LoginModal'
import Cart from '@/components/Cart'
import RecommendationSection from '@/components/RecommendationSection'
import ArtistBadge from '@/components/ArtistBadge'
import { likeArtwork } from '@/lib/comments'
import { useCart } from '@/contexts/CartContext'

export default function ArtworkDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
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
  const [showDeleteReviewConfirm, setShowDeleteReviewConfirm] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    loadArtwork()
  }, [params.id])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setFormData(prev => ({
          ...prev,
          email: currentUser.email || '',
          fullName: currentUser.displayName || currentUser.email?.split('@')[0] || ''
        }))
      }
    } catch (error) {
      // Allow guest viewing
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
  }

  const handleNextImage = () => {
    if (!artwork || !artwork.images) return
    setCurrentImageIndex((prev) => (prev === artwork.images.length - 1 ? 0 : prev + 1))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
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

  const handleBuyNow = () => {
    if (!user) {
      setLoginModalOpen(true)
      toast.error('Please sign in to purchase artworks')
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
    if (!user) {
      setLoginModalOpen(true)
      toast.error('Please sign in to submit a review')
      return
    }
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
      formData.append('userId', user.uid)
      formData.append('userName', user.displayName || user.email?.split('@')[0] || 'User')
      formData.append('userEmail', user.email || '')
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

  const handleLike = async () => {
    if (!user || !user.uid) {
      setLoginModalOpen(true)
      toast.error('Please sign in to like artworks')
      return
    }

    if (!artwork) return

    setLiking(true)
    try {
      await likeArtwork(artwork.id, user.uid)
      await loadArtwork() // Reload to get updated like count
      toast.success(artwork.likedBy?.includes(user.uid) ? 'Removed like' : 'Liked artwork')
    } catch (error) {
      toast.error('Failed to like artwork')
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
      setLoginModalOpen(true)
      toast.error('Please sign in to like reviews')
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
      setLoginModalOpen(true)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return null
  }

  const totalPrice = (artwork.price * quantity).toFixed(2)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/user')}
            className="btn-secondary flex items-center gap-2"
          >
            <FiArrowLeft />
            Back to Artworks
          </button>
          <Cart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artwork Images */}
          <div className="space-y-4">
            {artwork.images && artwork.images.length > 0 ? (
              <div className="card p-4">
                <div 
                  className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={artwork.images[currentImageIndex]}
                    alt={`${artwork.title} ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  
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
                            onClick={() => setCurrentImageIndex(idx)}
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
                  
                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all z-10"
                    aria-label="Share artwork"
                    title="Share this artwork"
                  >
                    <FiShare2 className="text-lg" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-4">
                <div className="relative w-full h-96 rounded-lg overflow-hidden mb-4 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              </div>
            )}
          </div>

          {/* Artwork Details */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-xl font-bold mb-4 text-gray-900">{artwork.title}</h1>
                  {artwork.artistId && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <ArtistBadge artistId={artwork.artistId} />
                    </div>
                  )}
                  <p className="text-gray-600 mb-4 whitespace-pre-wrap text-sm">{artwork.description}</p>
                </div>
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                    artwork.likedBy?.includes(user?.uid)
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FiThumbsUp className={`text-sm ${artwork.likedBy?.includes(user?.uid) ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{artwork.likes || 0}</span>
                </button>
              </div>
              {artwork.category && (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-xs mb-4">
                  {artwork.category}
                </span>
              )}
              <div className="border-t border-gray-300 pt-4">
                <p className="text-lg font-bold text-orange-600 mb-6">₹{artwork.price}</p>

                {!showCheckout ? (
                  <>
                    {/* Quantity Selector */}
                    <div className="mb-6">
                      <label className="block text-xs font-medium mb-2 text-gray-600">
                        Quantity (Max 5)
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white text-gray-900 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                        >
                          <FiMinus className="text-lg" />
                        </button>
                        <span className="text-lg font-bold w-10 text-center">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= 5}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white text-gray-900 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                        >
                          <FiPlus className="text-lg" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total Price:</span>
                        <span className="text-base font-bold text-orange-600">₹{totalPrice}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        <span className="text-orange-600">{quantity} × ₹{artwork.price} = ₹{totalPrice}</span>
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (!user) {
                            setLoginModalOpen(true)
                            toast.error('Please sign in to add items to cart')
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
                        className="btn-secondary flex-1 flex items-center justify-center gap-2 text-lg py-4"
                      >
                        <FiShoppingCart />
                        Add to Cart
                      </button>
                      <button
                        onClick={handleBuyNow}
                        className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg py-4"
                      >
                        <FiShoppingCart />
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

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary flex-1"
                      >
                        {submitting ? 'Placing Order...' : 'Confirm Order'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCheckout(false)}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="card p-6 mt-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Reviews</h2>
              
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

              {/* Review Form */}
              {user ? (
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
                    className="btn-primary text-xs py-2 px-4"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="mb-6 pb-6 border-b border-gray-200 text-center">
                  <p className="text-xs text-gray-600 mb-2">Sign in to write a review</p>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {artwork.comments && artwork.comments.length > 0 ? (
                  artwork.comments
                    .filter((comment: any) => comment.rating || comment.text)
                    .map((comment: any) => (
                      <div key={comment.id} className="pb-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-3 mb-2">
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
                                onClick={() => setExpandedComments({ ...expandedComments, [comment.id]: !expandedComments[comment.id] })}
                                disabled={!user}
                                className={`flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Similar Artworks Section */}
      {artwork && (
        <RecommendationSection
          type="similar"
          artworkId={artwork.id}
          title="Similar Artworks"
          subtitle="You might also like these"
          limit={6}
        />
      )}
    </div>
  )
}

