'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllArtworks, searchArtworks } from '@/lib/artworks'
import { getUserOrders, createOrder } from '@/lib/orders'
import { getUserWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist'
import { addComment, likeArtwork, isLiked } from '@/lib/comments'
import toast from 'react-hot-toast'
import { FiSearch, FiHeart, FiShoppingCart, FiShare2, FiMessageCircle, FiThumbsUp, FiHelpCircle } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import HelpSupport from './HelpSupport'
import LogoutButton from './LogoutButton'

export default function UserDashboard({ user }: { user: any }) {
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
    if (!user) return
    
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
      // Reload wishlist to ensure sync
      const updatedWishlist = await getUserWishlist(user.uid)
      setWishlist(updatedWishlist)
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('Failed to update wishlist')
    }
  }

  const handleLike = async (artworkId: string) => {
    if (!user) return
    
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div>
      {/* Logo - Only show on artworks tab */}
      {activeTab === 'artworks' && (
        <div className="text-center mb-6 relative">
          <div className="flex justify-end mb-2">
            <LogoutButton />
          </div>
          <div className="relative w-48 h-48 md:w-40 md:h-40 mx-auto mb-3 overflow-hidden" style={{ borderRadius: '0 0 50% 50%' }}>
            <img
              src="https://png.pngtree.com/png-vector/20240618/ourmid/pngtree-a-cute-girl-dancing-colorful-art-design-png-image_12793513.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div 
              className="absolute inset-0 border-2 border-black pointer-events-none"
              style={{ borderRadius: '0 0 50% 50%' }}
            ></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Fall in love with art</h1>
          <p className="text-gray-600 text-sm md:text-base italic mt-2">Turn Empty Walls into Expressions</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 md:gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('artworks')}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
            activeTab === 'artworks' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Artworks
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
            activeTab === 'wishlist' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Wishlist
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
            activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          My Orders
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
            activeTab === 'support' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <FiHelpCircle className="inline mr-1 text-xs md:text-sm" />
          Help & Support
        </button>
      </div>

      {/* Search Bar - Only show on artworks tab */}
      {activeTab === 'artworks' && (
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search artworks..."
              className="input-field pl-9 text-sm py-2"
            />
          </div>
        </div>
      )}

      {/* Artworks Tab */}
      {activeTab === 'artworks' && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading artworks...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {filteredArtworks.map((artwork: any) => (
                <div key={artwork.id} className="card p-3">
                  {artwork.images && artwork.images[0] && (
                    <div className="relative w-full h-40 md:h-48 mb-3 rounded-lg overflow-hidden">
                      <img
                        src={artwork.images[0]}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-base md:text-lg mb-1.5">{artwork.title}</h3>
                  <p className="text-gray-400 text-xs md:text-sm mb-2 line-clamp-2">{artwork.description}</p>
                  <p className="text-gray-900 font-bold text-lg md:text-xl mb-3">₹{artwork.price}</p>
                  
                  <div className="flex items-center gap-1.5 mb-3">
                    <button
                      onClick={() => handleLike(artwork.id)}
                      className="flex items-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors text-xs"
                    >
                      <FiThumbsUp className={artwork.likedBy?.includes(user?.uid) ? 'text-gray-900' : ''} />
                      <span className="text-xs">{artwork.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => setShowComments(showComments === artwork.id ? null : artwork.id)}
                      className="flex items-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors text-xs"
                    >
                      <FiMessageCircle className="text-xs" />
                      <span className="text-xs">{artwork.comments?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => handleShare(artwork)}
                      className="flex items-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors text-xs"
                    >
                      <FiShare2 className="text-xs" />
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleWishlist(artwork.id)}
                      className={`flex-1 flex items-center justify-center gap-1 btn-secondary text-xs py-1.5 ${
                        wishlist.includes(artwork.id) ? 'text-red-400' : ''
                      }`}
                    >
                      {wishlist.includes(artwork.id) ? <FaHeart className="text-xs" /> : <FiHeart className="text-xs" />}
                      <span className="text-xs">Wishlist</span>
                    </button>
                    <button
                      onClick={() => router.push(`/artwork/${artwork.id}`)}
                      className="flex-1 btn-primary text-xs py-1.5"
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments === artwork.id && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                        {artwork.comments?.map((comment: any) => (
                          <div key={comment.id} className="text-sm">
                            <p className="font-medium text-gray-900">{comment.userName}</p>
                            <p className="text-gray-600">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="input-field flex-1 text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleComment(artwork.id)
                            }
                          }}
                        />
                        <button
                          onClick={() => handleComment(artwork.id)}
                          className="btn-primary px-4"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
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
              <FiHeart className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {artworks
                .filter((artwork: any) => wishlist.includes(artwork.id))
                .map((artwork: any) => (
                  <div key={artwork.id} className="card p-3">
                    {artwork.images && artwork.images[0] && (
                      <div className="relative w-full h-40 md:h-48 mb-3 rounded-lg overflow-hidden">
                        <img
                          src={artwork.images[0]}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-bold text-base md:text-lg mb-1.5">{artwork.title}</h3>
                    <p className="text-gray-400 text-xs md:text-sm mb-2 line-clamp-2">{artwork.description}</p>
                    <p className="text-gray-900 font-bold text-lg md:text-xl mb-3">₹{artwork.price}</p>
                    <button
                      onClick={() => router.push(`/artwork/${artwork.id}`)}
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
              <FiShoppingCart className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">You have no orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="card p-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    {order.artworkImage && (
                      <div className="relative w-full md:w-24 h-24 rounded-lg overflow-hidden">
                        <img
                          src={order.artworkImage}
                          alt={order.artworkTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-base md:text-lg mb-1.5">{order.artworkTitle}</h3>
                      <div className="flex items-center gap-3 mb-1.5">
                        <p className="text-gray-400 text-xs">
                          Quantity: <span className="text-gray-900 font-medium">{order.quantity || 1}</span>
                        </p>
                        <p className="text-gray-400 text-xs">
                          Unit: <span className="text-gray-900 font-medium">₹{order.unitPrice || order.total}</span>
                        </p>
                      </div>
                      <p className="text-gray-900 font-bold text-lg md:text-xl mb-1.5">Total: ₹{order.total}</p>
                      <p className="text-gray-400 text-xs mb-1">
                        Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>
                      {order.paymentMethod === 'cod' && order.address1 && (
                        <div className="mt-1.5 p-1.5 bg-dark-card rounded text-xs">
                          <p className="text-gray-400">Delivery to: {order.address1}, {order.city}, {order.pincode}</p>
                        </div>
                      )}
                      <p className="text-gray-400 text-xs mb-1 mt-1.5">
                        Status: <span className={`font-medium ${
                          order.status === 'delivered' ? 'text-green-400' :
                          order.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
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
  )
}

