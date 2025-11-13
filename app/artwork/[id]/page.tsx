'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getArtworkById } from '@/lib/artworks'
import { createOrder } from '@/lib/orders'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi'
import LogoutButton from '@/components/LogoutButton'

export default function ArtworkDetailsPage() {
  const params = useParams()
  const router = useRouter()
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

  useEffect(() => {
    checkAuth()
    loadArtwork()
  }, [params.id])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }
      setUser(currentUser)
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || '',
        fullName: currentUser.displayName || currentUser.email?.split('@')[0] || ''
      }))
    } catch (error) {
      router.push('/')
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
    } catch (error) {
      toast.error('Failed to load artwork')
      router.push('/user')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= 5) {
      setQuantity(newQuantity)
    }
  }

  const handleBuyNow = () => {
    setShowCheckout(true)
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (paymentMethod === 'cod') {
        // Validate COD form fields
        if (!formData.fullName || !formData.phone || !formData.address1 || !formData.pincode || !formData.city) {
          toast.error('Please fill in all required fields')
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
          <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
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
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artwork Images */}
          <div className="space-y-4">
            {artwork.images && artwork.images.length > 0 && (
              <div className="card p-4">
                <div className="relative w-full h-96 rounded-lg overflow-hidden mb-4">
                  <img
                    src={artwork.images[0]}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {artwork.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {artwork.images.slice(1).map((img: string, idx: number) => (
                      <div key={idx} className="relative w-full h-24 rounded-lg overflow-hidden">
                        <img
                          src={img}
                          alt={`${artwork.title} ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Artwork Details */}
          <div className="space-y-6">
            <div className="card p-6">
              <h1 className="text-3xl font-bold mb-4 gradient-text">{artwork.title}</h1>
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">{artwork.description}</p>
              {artwork.category && (
                <span className="inline-block px-3 py-1 bg-neon-pink/20 text-neon-pink rounded-full text-sm mb-4">
                  {artwork.category}
                </span>
              )}
              <div className="border-t border-dark-border pt-4">
                <p className="text-4xl font-bold gradient-text mb-6">${artwork.price}</p>

                {!showCheckout ? (
                  <>
                    {/* Quantity Selector */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Quantity (Max 5)
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="btn-secondary w-12 h-12 flex items-center justify-center disabled:opacity-50"
                        >
                          <FiMinus />
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= 5}
                          className="btn-secondary w-12 h-12 flex items-center justify-center disabled:opacity-50"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-dark-card rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Price:</span>
                        <span className="text-3xl font-bold gradient-text">${totalPrice}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {quantity} × ${artwork.price} = ${totalPrice}
                      </p>
                    </div>

                    <button
                      onClick={handleBuyNow}
                      className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
                    >
                      <FiShoppingCart />
                      Buy Now
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    <h3 className="text-xl font-bold mb-4 gradient-text">Checkout</h3>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Payment Method *
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-dark-border rounded-lg hover:border-neon-pink/50 transition-colors">
                          <input
                            type="radio"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span>Cash on Delivery</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-dark-border rounded-lg hover:border-neon-pink/50 transition-colors">
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
                          <label className="block text-sm font-medium mb-2 text-gray-300">
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
                          <label className="block text-sm font-medium mb-2 text-gray-300">
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
                          <label className="block text-sm font-medium mb-2 text-gray-300">
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
                          <label className="block text-sm font-medium mb-2 text-gray-300">
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
                          <label className="block text-sm font-medium mb-2 text-gray-300">
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
                            <label className="block text-sm font-medium mb-2 text-gray-300">
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
                            <label className="block text-sm font-medium mb-2 text-gray-300">
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
                            <label className="block text-sm font-medium mb-2 text-gray-300">
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
                            <label className="block text-sm font-medium mb-2 text-gray-300">
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

                    <div className="p-4 bg-dark-card rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Quantity:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Unit Price:</span>
                        <span className="font-medium">${artwork.price}</span>
                      </div>
                      <div className="border-t border-dark-border pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">Total:</span>
                          <span className="text-2xl font-bold gradient-text">${totalPrice}</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}

