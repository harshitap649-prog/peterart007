'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCart, saveCart, addToCart as addToCartUtil, removeFromCart as removeFromCartUtil, updateCartItemQuantity as updateCartItemQuantityUtil, clearCart as clearCartUtil, getCartItemCount, getCartTotal } from '@/lib/cart'

interface CartItem {
  artworkId: string
  artworkTitle: string
  artworkImage: string
  unitPrice: number
  price?: number
  quantity: number
  addedAt?: string
}

interface CartContextType {
  cart: CartItem[]
  cartItemCount: number
  cartTotal: number
  addToCart: (item: Omit<CartItem, 'quantity' | 'addedAt'> & { quantity?: number }) => void
  removeFromCart: (artworkId: string) => void
  updateQuantity: (artworkId: string, quantity: number) => void
  clearCart: () => void
  refreshCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const refreshCart = () => {
    const cartData = getCart()
    setCart(cartData)
  }

  useEffect(() => {
    refreshCart()
    
    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'peterart_cart') {
        refreshCart()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addToCart = (item: Omit<CartItem, 'quantity' | 'addedAt'> & { quantity?: number }) => {
    const updatedCart = addToCartUtil(item)
    setCart(updatedCart)
  }

  const removeFromCart = (artworkId: string) => {
    const updatedCart = removeFromCartUtil(artworkId)
    setCart(updatedCart)
  }

  const updateQuantity = (artworkId: string, quantity: number) => {
    const updatedCart = updateCartItemQuantityUtil(artworkId, quantity)
    setCart(updatedCart)
  }

  const clearCart = () => {
    clearCartUtil()
    setCart([])
  }

  const cartItemCount = getCartItemCount()
  const cartTotal = getCartTotal()

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

