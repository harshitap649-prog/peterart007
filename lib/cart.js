// Cart utility functions for localStorage

const CART_STORAGE_KEY = 'peterart_cart'

export const getCart = () => {
  if (typeof window === 'undefined') return []
  
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY)
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    return []
  }
}

export const saveCart = (cart) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

export const addToCart = (item) => {
  const cart = getCart()
  
  // Check if item already exists in cart
  const existingIndex = cart.findIndex(
    (cartItem) => cartItem.artworkId === item.artworkId
  )
  
  if (existingIndex >= 0) {
    // Update quantity if item exists
    cart[existingIndex].quantity += item.quantity || 1
  } else {
    // Add new item
    cart.push({
      ...item,
      quantity: item.quantity || 1,
      addedAt: new Date().toISOString()
    })
  }
  
  saveCart(cart)
  return cart
}

export const removeFromCart = (artworkId) => {
  const cart = getCart()
  const updatedCart = cart.filter((item) => item.artworkId !== artworkId)
  saveCart(updatedCart)
  return updatedCart
}

export const updateCartItemQuantity = (artworkId, quantity) => {
  if (quantity <= 0) {
    return removeFromCart(artworkId)
  }
  
  const cart = getCart()
  const updatedCart = cart.map((item) =>
    item.artworkId === artworkId ? { ...item, quantity } : item
  )
  saveCart(updatedCart)
  return updatedCart
}

export const clearCart = () => {
  if (typeof window === 'undefined') return []
  localStorage.removeItem(CART_STORAGE_KEY)
  return []
}

export const getCartItemCount = () => {
  const cart = getCart()
  return cart.reduce((total, item) => total + (item.quantity || 1), 0)
}

export const getCartTotal = () => {
  const cart = getCart()
  return cart.reduce((total, item) => {
    return total + (item.unitPrice || item.price || 0) * (item.quantity || 1)
  }, 0)
}

