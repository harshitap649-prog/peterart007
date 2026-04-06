'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// import { useCart } from '@/contexts/CartContext'
// import { getCurrentUser } from '@/lib/auth'
// import { createOrder } from '@/lib/orders'
// import { loadPopunderAd } from '@/lib/popunderAd'
// import LoginModal from '@/components/LoginModal'
// import PaymentMethods from '@/components/PaymentMethods'
// import { updateOrderStatus } from '@/lib/orders'
// import { getSavedAddresses } from '@/lib/profile'
// import CouponInput from '@/components/CouponInput'
// import { calculateBulkDiscount } from '@/lib/coupons'

// Placeholders
interface CartItem {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  quantity: number;
  unitPrice: number;
  price: number;
  [key: string]: any;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  fullName?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
  [key: string]: any;
}

interface Address {
  fullName: string;
  phone: string;
  email: string;
  address1: string;
  address2?: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  [key: string]: any;
}

const useCart = () => ({ 
  cart: [] as CartItem[], 
  cartTotal: 0, 
  removeFromCart: (id: string) => {}, 
  updateQuantity: (id: string, quantity: number) => {}, 
  clearCart: () => {} 
})
const getCurrentUser = (): Promise<User | null> => Promise.resolve(null)
const createOrder = (data: any) => Promise.resolve('order-id')
const loadPopunderAd = (type: string) => console.log('Loading ad:', type)
const LoginModal = ({ children, isOpen, onClose }: any) => isOpen ? <div>{children}</div> : null
const PaymentMethods = ({ selectedMethod, onMethodChange, amount, orderId, userDetails, onPaymentSuccess, onPaymentError }: any) => <div>Payment Methods Placeholder</div>
const updateOrderStatus = (id: string, status: string) => Promise.resolve({})
const getSavedAddresses = (userId: string) => Promise.resolve([] as Address[])
const CouponInput = ({ onCouponApplied, onCouponRemoved, cartTotal, userId }: any) => <div>Coupon Input Placeholder</div>
const calculateBulkDiscount = (items: CartItem[]) => ({ discount: 0 })

import toast from 'react-hot-toast'
import { FiShoppingCart, FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'

export default function CartPage() {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart()
  
  // Calculate bulk discount
  useEffect(() => {
    if (cart.length > 0) {
      const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)
      const total = cart.reduce((sum, item) => {
        return sum + ((item.unitPrice || item.price || 0) * item.quantity)
      }, 0)
      const bulk = calculateBulkDiscount(cart)
      setBulkDiscount(bulk.discount)
    } else {
      setBulkDiscount(0)
    }
  }, [cart])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCheckout, setShowCheckout] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [orderIds, setOrderIds] = useState<string[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [bulkDiscount, setBulkDiscount] = useState(0)
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
          userId: user?.uid || '',
          userEmail: user?.email || '',
          userName: formData.fullName || user?.displayName || user?.email?.split('@')[0] || '',
          artworkId: item.artworkId,
          artworkTitle: item.artworkTitle,
          artworkImage: item.artworkImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.price || 0,
          total: Math.max(0, ((item.unitPrice || item.price || 0) * item.quantity) - (bulkDiscount / cart.length) - (couponDiscount / cart.length)),
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
          couponCode: appliedCoupon?.code || null,
          couponDiscount: couponDiscount / cart.length,
          bulkDiscount: bulkDiscount / cart.length,
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-2 md:px-4 py-2 md:py-6">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between mb-3 md:mb-6 gap-1.5 md:gap-2">
          <button
            onClick={() => router.push('/user')}
            className="btn-secondary flex items-center gap-1 md:gap-1.5 text-[10px] md:text-sm px-2 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-semibold shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-all"
          >
            <FiArrowLeft className="text-xs md:text-sm" />
            <span className="hidden sm:inline">Continue Shopping</span>
            <span className="sm:hidden">Back</span>
          </button>
          <h1 className="text-sm md:text-2xl font-bold text-gray-900 flex items-center gap-1.5 md:gap-3">
            <div className="w-6 h-6 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-md md:shadow-lg">
              <FiShoppingCart className="text-white text-xs md:text-xl" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:inline">Shopping Cart</span>
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent sm:hidden">Cart</span>
          </h1>
        </div>

        {cart.length === 0 ? (
          <>
            <div className="glass-panel p-4 md:p-12 text-center rounded-xl md:rounded-2xl">
              <div className="w-16 h-16 md:w-32 md:h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 shadow-md md:shadow-lg">
                <FiShoppingCart className="text-3xl md:text-6xl text-orange-600" />
              </div>
              <h2 className="text-sm md:text-2xl font-bold text-gray-900 mb-1.5 md:mb-3">Your cart is empty</h2>
              <p className="text-gray-600 text-xs md:text-lg mb-4 md:mb-8">Add some items to get started!</p>
              <button
                onClick={() => router.push('/user')}
                className="btn-primary text-xs md:text-base py-2 md:py-3 px-4 md:px-8 rounded-lg md:rounded-xl font-semibold shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all"
              >
                Browse Artworks
              </button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
            {/* Cart Items - Mobile Optimized */}
            <div className="lg:col-span-2 space-y-2 md:space-y-4">
              {cart.map((item) => (
                <div
                  key={item.artworkId}
                  className="glass-panel p-2 md:p-5 flex flex-col md:flex-row gap-2 md:gap-5 rounded-lg md:rounded-xl hover:shadow-lg md:hover:shadow-xl transition-all"
                >
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-full md:w-36 h-24 md:h-36 rounded-lg md:rounded-xl overflow-hidden shadow-md md:shadow-lg bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={item.artworkImage}
                      alt={item.artworkTitle}
                        className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3EImage%3C/text%3E%3C/svg%3E'
                      }}
                    />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2">
                        {item.artworkTitle}
                      </h3>
                      <p className="text-orange-600 font-bold text-sm md:text-xl mb-2 md:mb-4">
                        ₹{(item.unitPrice || item.price || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls - Mobile Optimized */}
                    <div className="flex items-center justify-between gap-1.5 md:gap-4">
                      <div className="flex items-center gap-1.5 md:gap-3">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.artworkId, item.quantity - 1)
                            } else {
                              removeFromCart(item.artworkId)
                              toast.success('Item removed from cart')
                            }
                          }}
                          className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl hover:bg-gray-100 transition-all border-2 border-gray-200 hover:border-orange-300 flex items-center justify-center shadow-sm hover:shadow-md"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="text-xs md:text-lg text-gray-700" />
                        </button>
                        <span className="text-sm md:text-xl font-bold text-gray-900 min-w-[1.5rem] md:min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.artworkId, item.quantity + 1)}
                          className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl hover:bg-gray-100 transition-all border-2 border-gray-200 hover:border-orange-300 flex items-center justify-center shadow-sm hover:shadow-md"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="text-xs md:text-lg text-gray-700" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-gray-600 text-[10px] md:text-sm mb-0.5 md:mb-1 font-medium">Subtotal</p>
                        <p className="text-sm md:text-xl font-bold text-orange-600">
                          ₹{((item.unitPrice || item.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          removeFromCart(item.artworkId)
                          toast.success('Item removed from cart')
                        }}
                        className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl text-red-500 hover:bg-red-50 transition-all border-2 border-red-200 hover:border-red-300 flex items-center justify-center shadow-sm hover:shadow-md"
                        aria-label="Remove item"
                      >
                        <FiTrash2 className="text-xs md:text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary - Mobile Optimized */}
            <div className="lg:col-span-1">
              <div className="glass-panel p-2 md:p-6 sticky top-4 rounded-xl md:rounded-2xl">
                <h2 className="text-sm md:text-xl font-bold text-gray-900 mb-3 md:mb-6 flex items-center gap-1.5 md:gap-2">
                  <span className="w-0.5 md:w-1 h-4 md:h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                  Order Summary
                </h2>
                
                {/* Coupon Input */}
                {user && (
                  <div className="space-y-2 md:space-y-4 mb-3 md:mb-4">
                    <CouponInput
                      onCouponApplied={(coupon: any, discount: any) => {
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
                  </div>
                )}
                
                <div className="space-y-1.5 md:space-y-3 mb-3 md:mb-6">
                  <div className="flex justify-between text-[10px] md:text-sm">
                    <span className="text-gray-600">Items ({cart.length}):</span>
                    <span className="font-medium text-orange-600">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  {bulkDiscount > 0 && (
                    <div className="flex justify-between text-[10px] md:text-sm text-green-600">
                      <span>Bulk Discount:</span>
                      <span className="font-medium">-₹{bulkDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[10px] md:text-sm text-green-600">
                      <span>Coupon ({appliedCoupon?.code}):</span>
                      <span className="font-medium">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] md:text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-1.5 md:pt-3">
                    <div className="flex justify-between text-xs md:text-base">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold text-orange-600">
                        ₹{Math.max(0, cartTotal - bulkDiscount - couponDiscount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {!showCheckout ? (
                  <button
                    onClick={handleCheckout}
                    className="btn-primary w-full text-xs md:text-base py-2 md:py-4 mb-2 md:mb-3 rounded-lg md:rounded-xl font-semibold shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <form onSubmit={handleOrderSubmit} className="space-y-2 md:space-y-4">
                    <h3 className="text-sm md:text-xl font-bold mb-3 md:mb-6 text-gray-900 flex items-center gap-1.5 md:gap-2">
                      <span className="w-0.5 md:w-1 h-4 md:h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                      Checkout
                    </h3>

                    {/* Saved Addresses - Mobile Optimized */}
                    {savedAddresses.length > 0 && (
                      <div>
                        <label className="block text-[10px] md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600">
                          Use Saved Address
                        </label>
                        <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-4">
                          {savedAddresses.map((address) => (
                            <label
                              key={address.id}
                              className={`flex items-start gap-1.5 md:gap-2 cursor-pointer p-2 md:p-3 border-2 rounded-lg transition-colors ${
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
                                    email: address.email || user?.email || '',
                                    address1: address.address1,
                                    address2: address.address2 || '',
                                    pincode: address.pincode,
                                    city: address.city,
                                    state: address.state || '',
                                    country: address.country || 'India'
                                  })
                                }}
                                className="mt-0.5 md:mt-1 w-3 h-3 md:w-4 md:h-4"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                  <span className="font-semibold text-[10px] md:text-sm text-gray-900 truncate">
                                    {address.fullName}
                                  </span>
                                  {address.isDefault && (
                                    <span className="text-[9px] md:text-xs bg-orange-100 text-gray-900 px-1 md:px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] md:text-xs text-gray-600 truncate">
                                  {address.address1}, {address.city}, {address.pincode}
                                </p>
                                <p className="text-[9px] md:text-xs text-gray-500">{address.phone}</p>
                              </div>
                            </label>
                          ))}
                          <button
                            onClick={() => {
                              setUseSavedAddress(false)
                              setSelectedAddressId(null)
                            }}
                            className="w-full text-[10px] md:text-sm text-gray-900 hover:text-orange-700 font-medium py-1 md:py-2"
                          >
                            + Use New Address
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Gifting Options - Mobile Optimized */}
                    <div className="border-t border-gray-200 pt-2 md:pt-4">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-4">
                        <input
                          type="checkbox"
                          id="isGift"
                          checked={isGift}
                          onChange={(e) => setIsGift(e.target.checked)}
                          className="w-3 h-3 md:w-4 md:h-4"
                        />
                        <label htmlFor="isGift" className="text-[10px] md:text-sm font-medium text-gray-900 cursor-pointer">
                          This is a gift
                        </label>
                      </div>
                      
                      {isGift && (
                        <div className="space-y-2 md:space-y-3 pl-3 md:pl-6 border-l-2 border-orange-200">
                          <div>
                            <label className="block text-[10px] md:text-sm font-medium mb-1 md:mb-2 text-gray-600">
                              Gift Message (Optional)
                            </label>
                            <textarea
                              value={giftMessage}
                              onChange={(e) => setGiftMessage(e.target.value)}
                              rows={3}
                              className="input-field text-[10px] md:text-sm py-1.5 md:py-2.5"
                              placeholder="Write a personal message for the recipient..."
                              maxLength={500}
                            />
                            <p className="text-[9px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{giftMessage.length}/500</p>
                          </div>
                          
                          <div>
                            <label className="block text-[10px] md:text-sm font-medium mb-1 md:mb-2 text-gray-600">
                              Schedule Delivery Date (Optional)
                            </label>
                            <input
                              type="date"
                              value={scheduledDeliveryDate}
                              onChange={(e) => setScheduledDeliveryDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="input-field text-[10px] md:text-sm py-1.5 md:py-2.5"
                            />
                            <p className="text-[9px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
                              Leave empty for immediate delivery
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Method - Mobile Optimized */}
                    <div>
                      <label className="block text-[10px] md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600">
                        Payment Method *
                      </label>
                      <div className="space-y-1.5 md:space-y-2">
                        <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2 md:p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                          <input
                            type="radio"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-3 h-3 md:w-4 md:h-4"
                          />
                          <span className="text-[10px] md:text-sm">Cash on Delivery</span>
                        </label>
                        <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer p-2 md:p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                          <input
                            type="radio"
                            value="online"
                            checked={paymentMethod === 'online'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-3 h-3 md:w-4 md:h-4"
                          />
                          <span className="text-[10px] md:text-sm">Online Payment</span>
                        </label>
                      </div>
                    </div>

                    {paymentMethod === 'online' && showPayment && orderIds.length > 0 && (
                      <PaymentMethods
                        amount={cartTotal}
                        orderId={orderIds[0]}
                        userDetails={{
                          name: formData.fullName || user?.displayName || '',
                          email: formData.email || user?.email || '',
                          phone: formData.phone || ''
                        }}
                        onPaymentSuccess={(paymentData: any) => handlePaymentSuccess(paymentData, orderIds)}
                        onPaymentError={handlePaymentError}
                      />
                    )}

                    {paymentMethod === 'cod' && !useSavedAddress && (
                      <>
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600 flex items-center gap-1">
                            <FiUser className="text-[10px] md:text-xs" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="input-field text-xs md:text-sm py-2 md:py-2.5"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600 flex items-center gap-1">
                            <FiPhone className="text-[10px] md:text-xs" />
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input-field text-xs md:text-sm py-2 md:py-2.5"
                            placeholder="+91 1234567890"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600 flex items-center gap-1">
                            <FiMail className="text-[10px] md:text-xs" />
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-field text-xs md:text-sm py-2 md:py-2.5"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600 flex items-center gap-1">
                            <FiMapPin className="text-[10px] md:text-xs" />
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            value={formData.address1}
                            onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                            className="input-field text-xs md:text-sm py-2 md:py-2.5"
                            placeholder="Street address, house number"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={formData.address2}
                            onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                            className="input-field text-xs md:text-sm py-2 md:py-2.5"
                            placeholder="Apartment, suite, etc. (optional)"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                          <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              value={formData.pincode}
                              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                              className="input-field text-xs md:text-sm py-2 md:py-2.5"
                              placeholder="123456"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600">
                              City *
                            </label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="input-field text-xs md:text-sm py-2 md:py-2.5"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                          <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600">
                              State
                            </label>
                            <input
                              type="text"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className="input-field text-xs md:text-sm py-2 md:py-2.5"
                            />
                          </div>
                          <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-600">
                              Country
                            </label>
                            <input
                              type="text"
                              value={formData.country}
                              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                              className="input-field text-xs md:text-sm py-2 md:py-2.5"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="flex gap-2 md:gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn-primary flex-1 text-xs md:text-sm py-2 md:py-2.5 rounded-lg md:rounded-xl"
                        >
                          {submitting ? 'Placing...' : 'Confirm Orders'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCheckout(false)}
                          className="btn-secondary text-xs md:text-sm py-2 md:py-2.5 px-3 md:px-4 rounded-lg md:rounded-xl"
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
          onSuccess={(user: User) => {
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

