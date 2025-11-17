'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { getCurrentUser } from '@/lib/auth'
import { createOrder } from '@/lib/orders'
import { loadPopunderAd } from '@/lib/popunderAd'
import toast from 'react-hot-toast'
import { FiShoppingCart, FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'
import LoginModal from '@/components/LoginModal'
import PaymentMethods from '@/components/PaymentMethods'
import { updateOrderStatus } from '@/lib/orders'
import { getSavedAddresses } from '@/lib/profile'
import CouponInput from '@/components/CouponInput'
import GiftCardInput from '@/components/GiftCardInput'
import { calculateBulkDiscount } from '@/lib/coupons'

export default function CartPage() {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart()
  
  // Calculate bulk discount
  useEffect(() => {
    if (cart.length > 0) {
      const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)
      const total = cart.reduce((sum, item) => {
        return sum + ((item.unitPrice || item.price || 0) * item.quantity)
      }, 0)
      const bulk = calculateBulkDiscount(totalQuantity, total / totalQuantity)
      setBulkDiscount(bulk.discount)
    } else {
      setBulkDiscount(0)
    }
  }, [cart])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCheckout, setShowCheckout] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [orderIds, setOrderIds] = useState<string[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [bulkDiscount, setBulkDiscount] = useState(0)
  const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null)
  const [giftCardDiscount, setGiftCardDiscount] = useState(0)
  const [isGift, setIsGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState('')
  const router = useRouter()

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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        if (currentUser) {
          setFormData(prev => ({
            ...prev,
            email: currentUser.email || '',
            fullName: currentUser.displayName || currentUser.email?.split('@')[0] || ''
          }))
          // Load saved addresses
          try {
            const addresses = await getSavedAddresses(currentUser.uid)
            setSavedAddresses(addresses)
            const defaultAddress = addresses.find((addr: any) => addr.isDefault)
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id)
              setUseSavedAddress(true)
              setFormData({
                fullName: defaultAddress.fullName,
                phone: defaultAddress.phone,
                email: defaultAddress.email || currentUser.email || '',
                address1: defaultAddress.address1,
                address2: defaultAddress.address2 || '',
                pincode: defaultAddress.pincode,
                city: defaultAddress.city,
                state: defaultAddress.state || '',
                country: defaultAddress.country || 'India'
              })
            }
          } catch (error) {
            console.error('Error loading addresses:', error)
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const handleCheckout = () => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setShowCheckout(true)
  }

  const handlePaymentSuccess = async (paymentData: any, orderIds: string[]) => {
    try {
      // Update payment status for all orders
      const updatePromises = orderIds.map((orderId) =>
        updateOrderStatus(orderId, 'confirmed').then(() => {
          // Update payment status via API
          return fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: orderId,
              paymentStatus: 'paid',
              paymentId: paymentData.paymentId
            })
          })
        })
      )

      await Promise.all(updatePromises)
      toast.success('Payment successful! Orders placed.')
      clearCart()
      loadPopunderAd('order')
      setTimeout(() => {
        router.push('/user?tab=orders')
      }, 1000)
    } catch (error: any) {
      toast.error('Payment successful but failed to update orders')
    }
  }

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error)
    toast.error(error.message || 'Payment failed')
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSubmitting(true)

    try {
      if (!formData.fullName || !formData.phone || !formData.address1 || !formData.pincode || !formData.city) {
        toast.error('Please fill in all required fields')
        setSubmitting(false)
        return
      }

      // Create orders for each cart item
      const orderPromises = cart.map((item) =>
        createOrder({
          userId: user.uid,
          userEmail: user.email,
          userName: formData.fullName || user.displayName || user.email.split('@')[0],
          artworkId: item.artworkId,
          artworkTitle: item.artworkTitle,
          artworkImage: item.artworkImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.price || 0,
          total: Math.max(0, ((item.unitPrice || item.price || 0) * item.quantity) - (bulkDiscount / cart.length) - (couponDiscount / cart.length) - (giftCardDiscount / cart.length)),
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
          couponCode: appliedCoupon?.code || null,
          couponDiscount: couponDiscount / cart.length,
          bulkDiscount: bulkDiscount / cart.length,
          giftCardCode: appliedGiftCard?.code || null,
          giftCardDiscount: giftCardDiscount / cart.length,
          isGift: isGift,
          giftMessage: isGift ? giftMessage : null,
          scheduledDeliveryDate: scheduledDeliveryDate || null,
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
      )

      const orders = await Promise.all(orderPromises)
      const createdOrderIds = orders.map((o: any) => o.id)
      setOrderIds(createdOrderIds)

      // Redeem gift card if applied
      if (appliedGiftCard && giftCardDiscount > 0) {
        try {
          const { redeemGiftCard } = await import('@/lib/giftcards')
          // Redeem for the first order (or split across orders if needed)
          await redeemGiftCard(appliedGiftCard.code, createdOrderIds[0], giftCardDiscount)
        } catch (error) {
          console.error('Error redeeming gift card:', error)
          // Continue even if gift card redemption fails
        }
      }

      // If COD, complete the order
      if (paymentMethod === 'cod') {
        toast.success('Orders placed successfully!')
        clearCart()
        loadPopunderAd('order')
        setTimeout(() => {
          router.push('/user?tab=orders')
        }, 1000)
      } else if (paymentMethod === 'online') {
        // Show payment methods for online payment
        setShowPayment(true)
        setSubmitting(false) // Stop submitting state to show payment UI
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to place orders')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/user')}
            className="btn-secondary flex items-center gap-2 text-sm md:text-base"
          >
            <FiArrowLeft />
            Continue Shopping
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiShoppingCart className="text-orange-600" />
            Shopping Cart
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="card p-8 md:p-12 text-center">
            <FiShoppingCart className="text-6xl md:text-8xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some items to get started!</p>
            <button
              onClick={() => router.push('/user')}
              className="btn-primary text-sm md:text-base py-2.5 px-6"
            >
              Browse Artworks
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.artworkId}
                  className="card p-4 md:p-6 flex flex-col md:flex-row gap-4"
                >
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.artworkImage}
                      alt={item.artworkTitle}
                      className="w-full md:w-32 h-32 md:h-32 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3EImage%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                        {item.artworkTitle}
                      </h3>
                      <p className="text-orange-600 font-bold text-lg md:text-xl mb-4">
                        ₹{(item.unitPrice || item.price || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.artworkId, item.quantity - 1)
                            } else {
                              removeFromCart(item.artworkId)
                              toast.success('Item removed from cart')
                            }
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="text-lg" />
                        </button>
                        <span className="text-lg font-semibold text-gray-900 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.artworkId, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="text-lg" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-gray-500 text-sm mb-1">Subtotal</p>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{((item.unitPrice || item.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          removeFromCart(item.artworkId)
                          toast.success('Item removed from cart')
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-4 md:p-6 sticky top-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Coupon Input */}
                {user && (
                  <div className="space-y-4 mb-4">
                    <CouponInput
                      onCouponApplied={(coupon, discount) => {
                        setAppliedCoupon(coupon)
                        setCouponDiscount(discount)
                      }}
                      onCouponRemoved={() => {
                        setAppliedCoupon(null)
                        setCouponDiscount(0)
                      }}
                      cartTotal={cartTotal - bulkDiscount}
                      userId={user.uid}
                    />
                    <GiftCardInput
                      onApply={(giftCard, amount) => {
                        setAppliedGiftCard({ ...giftCard, appliedAmount: amount })
                        setGiftCardDiscount(amount)
                      }}
                      onRemove={() => {
                        setAppliedGiftCard(null)
                        setGiftCardDiscount(0)
                      }}
                      appliedGiftCard={appliedGiftCard}
                      maxAmount={cartTotal - bulkDiscount - couponDiscount}
                    />
                  </div>
                )}
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">Items ({cart.length}):</span>
                    <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  {bulkDiscount > 0 && (
                    <div className="flex justify-between text-sm md:text-base text-green-600">
                      <span>Bulk Discount:</span>
                      <span className="font-medium">-₹{bulkDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm md:text-base text-green-600">
                      <span>Coupon Discount ({appliedCoupon?.code}):</span>
                      <span className="font-medium">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {giftCardDiscount > 0 && (
                    <div className="flex justify-between text-sm md:text-base text-green-600">
                      <span>Gift Card ({appliedGiftCard?.code}):</span>
                      <span className="font-medium">-₹{giftCardDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base md:text-lg">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold text-orange-600">
                        ₹{Math.max(0, cartTotal - bulkDiscount - couponDiscount - giftCardDiscount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {!showCheckout ? (
                  <button
                    onClick={handleCheckout}
                    className="btn-primary w-full text-sm md:text-base py-3 mb-3"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Checkout</h3>

                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-600">
                          Use Saved Address
                        </label>
                        <div className="space-y-2 mb-4">
                          {savedAddresses.map((address) => (
                            <label
                              key={address.id}
                              className={`flex items-start gap-2 cursor-pointer p-3 border-2 rounded-lg transition-colors ${
                                selectedAddressId === address.id
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="savedAddress"
                                checked={useSavedAddress && selectedAddressId === address.id}
                                onChange={() => {
                                  setSelectedAddressId(address.id)
                                  setUseSavedAddress(true)
                                  setFormData({
                                    fullName: address.fullName,
                                    phone: address.phone,
                                    email: address.email || user.email || '',
                                    address1: address.address1,
                                    address2: address.address2 || '',
                                    pincode: address.pincode,
                                    city: address.city,
                                    state: address.state || '',
                                    country: address.country || 'India'
                                  })
                                }}
                                className="mt-1 w-4 h-4"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-sm text-gray-900">
                                    {address.fullName}
                                  </span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">
                                  {address.address1}, {address.city}, {address.pincode}
                                </p>
                                <p className="text-xs text-gray-500">{address.phone}</p>
                              </div>
                            </label>
                          ))}
                          <button
                            onClick={() => {
                              setUseSavedAddress(false)
                              setSelectedAddressId(null)
                            }}
                            className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium py-2"
                          >
                            + Use New Address
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Gifting Options */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <input
                          type="checkbox"
                          id="isGift"
                          checked={isGift}
                          onChange={(e) => setIsGift(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label htmlFor="isGift" className="text-sm font-medium text-gray-900 cursor-pointer">
                          This is a gift
                        </label>
                      </div>
                      
                      {isGift && (
                        <div className="space-y-3 pl-6 border-l-2 border-orange-200">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              Gift Message (Optional)
                            </label>
                            <textarea
                              value={giftMessage}
                              onChange={(e) => setGiftMessage(e.target.value)}
                              rows={3}
                              className="input-field text-sm"
                              placeholder="Write a personal message for the recipient..."
                              maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">{giftMessage.length}/500</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              Schedule Delivery Date (Optional)
                            </label>
                            <input
                              type="date"
                              value={scheduledDeliveryDate}
                              onChange={(e) => setScheduledDeliveryDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="input-field text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Leave empty for immediate delivery
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

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
                          <span className="text-sm md:text-base">Cash on Delivery</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                          <input
                            type="radio"
                            value="online"
                            checked={paymentMethod === 'online'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm md:text-base">Online Payment</span>
                        </label>
                      </div>
                    </div>

                    {paymentMethod === 'online' && showPayment && orderIds.length > 0 && (
                      <PaymentMethods
                        amount={cartTotal}
                        orderId={orderIds[0]}
                        userDetails={{
                          name: formData.fullName || user.displayName || '',
                          email: formData.email || user.email || '',
                          phone: formData.phone || ''
                        }}
                        onPaymentSuccess={(paymentData) => handlePaymentSuccess(paymentData, orderIds)}
                        onPaymentError={handlePaymentError}
                      />
                    )}

                    {paymentMethod === 'cod' && !useSavedAddress && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600 flex items-center gap-1">
                            <FiUser className="text-xs" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="input-field text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600 flex items-center gap-1">
                            <FiPhone className="text-xs" />
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input-field text-sm"
                            placeholder="+91 1234567890"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600 flex items-center gap-1">
                            <FiMail className="text-xs" />
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-field text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600 flex items-center gap-1">
                            <FiMapPin className="text-xs" />
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            value={formData.address1}
                            onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                            className="input-field text-sm"
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
                            className="input-field text-sm"
                            placeholder="Apartment, suite, etc. (optional)"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              value={formData.pincode}
                              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                              className="input-field text-sm"
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
                              className="input-field text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              State
                            </label>
                            <input
                              type="text"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className="input-field text-sm"
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
                              className="input-field text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn-primary flex-1 text-sm md:text-base py-2.5"
                        >
                          {submitting ? 'Placing Orders...' : 'Confirm Orders'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCheckout(false)}
                          className="btn-secondary text-sm md:text-base py-2.5 px-4"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {loginModalOpen && (
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onSuccess={(user) => {
            setUser(user)
            setLoginModalOpen(false)
            setFormData(prev => ({
              ...prev,
              email: user.email || '',
              fullName: user.displayName || user.email?.split('@')[0] || ''
            }))
          }}
        />
      )}
    </div>
  )
}

