// Inventory management functions

import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase.config'

// Get artwork inventory
export const getArtworkInventory = async (artworkId) => {
  try {
    const artworkDoc = await getDoc(doc(db, 'artworks', artworkId))
    if (artworkDoc.exists()) {
      const data = artworkDoc.data()
      return {
        stock: data.stock || 0,
        lowStockThreshold: data.lowStockThreshold || 5,
        allowPreOrder: data.allowPreOrder || false,
        isOutOfStock: (data.stock || 0) <= 0
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching inventory:', error)
    throw error
  }
}

// Update stock quantity
export const updateStock = async (artworkId, quantity, operation = 'decrease') => {
  try {
    const artworkRef = doc(db, 'artworks', artworkId)
    const artworkDoc = await getDoc(artworkRef)
    
    if (!artworkDoc.exists()) {
      throw new Error('Artwork not found')
    }
    
    const currentStock = artworkDoc.data().stock || 0
    let newStock
    
    if (operation === 'decrease') {
      newStock = Math.max(0, currentStock - quantity)
    } else if (operation === 'increase') {
      newStock = currentStock + quantity
    } else if (operation === 'set') {
      newStock = quantity
    }
    
    await updateDoc(artworkRef, {
      stock: newStock,
      updatedAt: new Date().toISOString()
    })
    
    // Check for low stock alert
    const lowStockThreshold = artworkDoc.data().lowStockThreshold || 5
    if (newStock <= lowStockThreshold && newStock > 0) {
      // Trigger low stock notification (can be sent to admin)
      console.log(`Low stock alert for artwork ${artworkId}: ${newStock} items remaining`)
    }
    
    return { stock: newStock }
  } catch (error) {
    console.error('Error updating stock:', error)
    throw error
  }
}

// Check if artwork is in stock
export const checkStock = async (artworkId, requestedQuantity = 1) => {
  try {
    const inventory = await getArtworkInventory(artworkId)
    if (!inventory) {
      return { available: false, reason: 'Artwork not found' }
    }
    
    if (inventory.isOutOfStock) {
      if (inventory.allowPreOrder) {
        return { available: true, preOrder: true, stock: 0 }
      }
      return { available: false, reason: 'Out of stock', preOrder: false }
    }
    
    if (inventory.stock < requestedQuantity) {
      if (inventory.allowPreOrder) {
        return { 
          available: true, 
          preOrder: true, 
          stock: inventory.stock,
          availableQuantity: inventory.stock
        }
      }
      return { 
        available: false, 
        reason: `Only ${inventory.stock} items available`,
        stock: inventory.stock
      }
    }
    
    return { available: true, stock: inventory.stock, preOrder: false }
  } catch (error) {
    console.error('Error checking stock:', error)
    throw error
  }
}

// Get low stock items
export const getLowStockItems = async () => {
  try {
    const artworksRef = collection(db, 'artworks')
    const snapshot = await getDocs(artworksRef)
    
    const lowStockItems = []
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const stock = data.stock || 0
      const threshold = data.lowStockThreshold || 5
      
      if (stock > 0 && stock <= threshold) {
        lowStockItems.push({
          id: doc.id,
          title: data.title,
          stock,
          threshold,
          ...data
        })
      }
    })
    
    return lowStockItems
  } catch (error) {
    console.error('Error fetching low stock items:', error)
    throw error
  }
}

// Get out of stock items
export const getOutOfStockItems = async () => {
  try {
    const artworksRef = collection(db, 'artworks')
    const snapshot = await getDocs(artworksRef)
    
    const outOfStockItems = []
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const stock = data.stock || 0
      
      if (stock <= 0) {
        outOfStockItems.push({
          id: doc.id,
          title: data.title,
          stock,
          allowPreOrder: data.allowPreOrder || false,
          ...data
        })
      }
    })
    
    return outOfStockItems
  } catch (error) {
    console.error('Error fetching out of stock items:', error)
    throw error
  }
}

// Subscribe to back-in-stock notifications
export const subscribeToBackInStock = async (artworkId, userId, email) => {
  try {
    const notificationRef = doc(collection(db, 'backInStockNotifications'))
    await setDoc(notificationRef, {
      artworkId,
      userId,
      email,
      notified: false,
      createdAt: new Date().toISOString()
    })
    return { success: true }
  } catch (error) {
    console.error('Error subscribing to back-in-stock:', error)
    throw error
  }
}

// Check and notify back-in-stock subscribers
export const checkBackInStock = async (artworkId) => {
  try {
    const artworkDoc = await getDoc(doc(db, 'artworks', artworkId))
    if (!artworkDoc.exists()) {
      return { hasStock: false }
    }
    
    const stock = artworkDoc.data().stock || 0
    if (stock > 0) {
      // Get all subscribers for this artwork
      const notificationsRef = collection(db, 'backInStockNotifications')
      const q = query(
        notificationsRef,
        where('artworkId', '==', artworkId),
        where('notified', '==', false)
      )
      const snapshot = await getDocs(q)
      
      // Mark as notified (actual email sending would be done via backend/cloud function)
      const updatePromises = snapshot.docs.map(doc =>
        updateDoc(doc.ref, {
          notified: true,
          notifiedAt: new Date().toISOString()
        })
      )
      
      await Promise.all(updatePromises)
      
      return { hasStock: true, subscribers: snapshot.size }
    }
    
    return { hasStock: false }
  } catch (error) {
    console.error('Error checking back-in-stock:', error)
    throw error
  }
}

