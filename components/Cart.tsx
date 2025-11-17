'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { FiShoppingCart, FiX, FiMinus, FiPlus, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Cart() {
  const { cart, cartItemCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const router = useRouter()

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setIsOpen(false)
    router.push('/cart')
  }

  return (
    <>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors"
        aria-label="Shopping cart"
      >
        <FiShoppingCart className="text-xl md:text-2xl" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartItemCount > 9 ? '9+' : cartItemCount}
          </span>
        )}
      </button>

      {/* Cart Preview Sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cart Sidebar */}
          <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiShoppingCart className="text-orange-600" />
                Shopping Cart
                {cartItemCount > 0 && (
                  <span className="text-sm font-normal text-gray-500">({cartItemCount})</span>
                )}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <FiShoppingCart className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-sm md:text-base mb-2">Your cart is empty</p>
                  <p className="text-gray-400 text-xs md:text-sm">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.artworkId}
                      className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                    >
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.artworkImage}
                          alt={item.artworkTitle}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3EImage%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate mb-1">
                          {item.artworkTitle}
                        </h3>
                        <p className="text-orange-600 font-bold text-sm md:text-base mb-2">
                          ₹{(item.unitPrice || item.price || 0).toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.artworkId, item.quantity - 1)
                              } else {
                                removeFromCart(item.artworkId)
                                toast.success('Item removed from cart')
                              }
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="text-sm" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.artworkId, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="text-sm" />
                          </button>
                          <button
                            onClick={() => {
                              removeFromCart(item.artworkId)
                              toast.success('Item removed from cart')
                            }}
                            className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            aria-label="Remove item"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base font-medium">Total:</span>
                  <span className="text-lg md:text-xl font-bold text-gray-900">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCheckout}
                    className="btn-primary flex-1 text-sm md:text-base py-2.5"
                  >
                    Checkout
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="btn-secondary text-sm md:text-base py-2.5 px-4"
                    aria-label="Clear cart"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/cart')
                  }}
                  className="w-full text-center text-orange-600 hover:text-orange-700 text-sm font-medium py-2"
                >
                  View Full Cart
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] p-4 transition-opacity duration-300"
          onClick={() => setShowClearConfirm(false)}
        >
          <div 
            className="card p-6 md:p-8 max-w-md w-full bg-white shadow-2xl border-2 border-gray-200 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-full border-2 border-red-200">
                <FiAlertTriangle className="text-4xl text-red-600" />
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-3">
              Clear Shopping Cart?
            </h3>
            
            <p className="text-gray-600 text-sm md:text-base text-center mb-6 leading-relaxed">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>

            {cart.length > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Items in cart:</p>
                    <p className="text-base font-bold text-gray-900">{cart.length} item{cart.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Total Amount:</p>
                    <p className="text-base font-bold text-orange-600">₹{cartTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary flex-1 text-sm md:text-base py-3 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart()
                  setShowClearConfirm(false)
                  setIsOpen(false)
                  toast.success('Cart cleared successfully')
                }}
                className="flex-1 text-sm md:text-base py-3 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiTrash2 className="text-sm" />
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

