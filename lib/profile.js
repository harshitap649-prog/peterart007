// User profile management functions

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase.config'
import { updateProfile } from 'firebase/auth'

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    })
    
    // Also update Firebase Auth profile if user is logged in
    const currentUser = auth.currentUser
    if (currentUser && currentUser.uid === userId) {
      const updateData = {}
      if (profileData.name) updateData.displayName = profileData.name
      if (profileData.photoURL) updateData.photoURL = profileData.photoURL
      if (Object.keys(updateData).length > 0) {
        await updateProfile(currentUser, updateData)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Upload profile picture - converts to base64 and stores in Firestore
export const uploadProfilePicture = async (userId, file) => {
  try {
    // Convert file to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async () => {
        try {
          const base64String = reader.result
          // base64String is already in format: "data:image/jpeg;base64,/9j/4AAQ..."
          
          // Update profile with new photo URL (base64 data URL)
          await updateUserProfile(userId, { photoURL: base64String })
          
          // Update Firebase Auth (if possible, though base64 might be too long)
          const currentUser = auth.currentUser
          if (currentUser && currentUser.uid === userId) {
            try {
              // Try to update auth profile, but it might fail if base64 is too long
              // Firebase Auth has a limit on photoURL length, so we'll just update Firestore
              // The photoURL in auth might not work, but Firestore will have it
            } catch (authError) {
              console.warn('Could not update Firebase Auth photoURL (base64 may be too long):', authError)
            }
          }
          
          resolve(base64String)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = (error) => {
        reject(error)
      }
      
      reader.readAsDataURL(file)
    })
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    throw error
  }
}

// Get saved addresses
export const getSavedAddresses = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return data.addresses || []
    }
    return []
  } catch (error) {
    console.error('Error fetching addresses:', error)
    throw error
  }
}

// Add saved address
export const addSavedAddress = async (userId, address) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    const currentData = userDoc.exists() ? userDoc.data() : {}
    const addresses = currentData.addresses || []
    
    const newAddress = {
      id: Date.now().toString(),
      ...address,
      createdAt: new Date().toISOString()
    }
    
    // If this is the first address or marked as default, set it as default
    if (addresses.length === 0 || address.isDefault) {
      newAddress.isDefault = true
      // Remove default from other addresses
      addresses.forEach(addr => {
        addr.isDefault = false
      })
    }
    
    addresses.push(newAddress)
    
    await updateDoc(userRef, {
      addresses,
      updatedAt: new Date().toISOString()
    })
    
    return newAddress
  } catch (error) {
    console.error('Error adding address:', error)
    throw error
  }
}

// Update saved address
export const updateSavedAddress = async (userId, addressId, addressData) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    const currentData = userDoc.data()
    const addresses = currentData.addresses || []
    
    const index = addresses.findIndex(addr => addr.id === addressId)
    if (index === -1) {
      throw new Error('Address not found')
    }
    
    // If setting as default, remove default from others
    if (addressData.isDefault) {
      addresses.forEach(addr => {
        if (addr.id !== addressId) {
          addr.isDefault = false
        }
      })
    }
    
    addresses[index] = {
      ...addresses[index],
      ...addressData,
      updatedAt: new Date().toISOString()
    }
    
    await updateDoc(userRef, {
      addresses,
      updatedAt: new Date().toISOString()
    })
    
    return addresses[index]
  } catch (error) {
    console.error('Error updating address:', error)
    throw error
  }
}

// Delete saved address
export const deleteSavedAddress = async (userId, addressId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    const currentData = userDoc.data()
    const addresses = (currentData.addresses || []).filter(addr => addr.id !== addressId)
    
    await updateDoc(userRef, {
      addresses,
      updatedAt: new Date().toISOString()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting address:', error)
    throw error
  }
}

// Set default address
export const setDefaultAddress = async (userId, addressId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    const currentData = userDoc.data()
    const addresses = currentData.addresses || []
    
    addresses.forEach(addr => {
      addr.isDefault = addr.id === addressId
    })
    
    await updateDoc(userRef, {
      addresses,
      updatedAt: new Date().toISOString()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error setting default address:', error)
    throw error
  }
}

