// Coupon and discount management

import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase.config'

// Get all coupons
export const getAllCoupons = async () => {
  try {
    const couponsRef = collection(db, 'coupons')
    const snapshot = await getDocs(couponsRef)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching coupons:', error)
    throw error
  }
}

// Get active coupons
export const getActiveCoupons = async () => {
  try {
    const coupons = await getAllCoupons()
    const now = new Date()
    return coupons.filter(coupon => {
      if (!coupon.isActive) return false
      if (coupon.validFrom && new Date(coupon.validFrom) > now) return false
      if (coupon.validUntil && new Date(coupon.validUntil) < now) return false
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false
      return true
    })
  } catch (error) {
    console.error('Error fetching active coupons:', error)
    throw error
  }
}

// Validate coupon code
export const validateCoupon = async (code, userId, cartTotal) => {
  try {
    const couponsRef = collection(db, 'coupons')
    const q = query(couponsRef, where('code', '==', code.toUpperCase()))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return { valid: false, error: 'Invalid coupon code' }
    }
    
    const couponDoc = snapshot.docs[0]
    const coupon = { id: couponDoc.id, ...couponDoc.data() }
    
    // Check if coupon is active
    if (!coupon.isActive) {
      return { valid: false, error: 'This coupon is not active' }
    }
    
    // Check validity dates
    const now = new Date()
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { valid: false, error: 'This coupon is not yet valid' }
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { valid: false, error: 'This coupon has expired' }
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'This coupon has reached its usage limit' }
    }
    
    // Check minimum order amount
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return { valid: false, error: `Minimum order amount of ₹${coupon.minOrderAmount} required` }
    }
    
    // Check if user has already used this coupon (for one-time use coupons)
    if (coupon.oneTimeUse) {
      const userCouponsRef = collection(db, 'userCoupons')
      const userQ = query(
        userCouponsRef,
        where('userId', '==', userId),
        where('couponId', '==', coupon.id)
      )
      const userSnapshot = await getDocs(userQ)
      if (!userSnapshot.empty) {
        return { valid: false, error: 'You have already used this coupon' }
      }
    }
    
    // Check if first-time buyer discount
    if (coupon.type === 'firstTimeBuyer') {
      const ordersRef = collection(db, 'orders')
      const ordersQ = query(ordersRef, where('userId', '==', userId))
      const ordersSnapshot = await getDocs(ordersQ)
      if (!ordersSnapshot.empty) {
        return { valid: false, error: 'This coupon is only for first-time buyers' }
      }
    }
    
    // Calculate discount
    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount)
      }
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue
    }
    
    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount
      },
      discount,
      finalAmount: cartTotal - discount
    }
  } catch (error) {
    console.error('Error validating coupon:', error)
    throw error
  }
}

// Apply coupon
export const applyCoupon = async (code, userId, orderId) => {
  try {
    const couponsRef = collection(db, 'coupons')
    const q = query(couponsRef, where('code', '==', code.toUpperCase()))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      throw new Error('Invalid coupon code')
    }
    
    const couponDoc = snapshot.docs[0]
    const couponRef = doc(db, 'coupons', couponDoc.id)
    
    // Update coupon usage
    await updateDoc(couponRef, {
      usedCount: (couponDoc.data().usedCount || 0) + 1,
      lastUsedAt: new Date().toISOString()
    })
    
    // Record user coupon usage
    if (couponDoc.data().oneTimeUse) {
      await setDoc(doc(db, 'userCoupons', `${userId}_${couponDoc.id}`), {
        userId,
        couponId: couponDoc.id,
        orderId,
        usedAt: new Date().toISOString()
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error applying coupon:', error)
    throw error
  }
}

// Calculate bulk discount
export const calculateBulkDiscount = (quantity, unitPrice) => {
  const total = quantity * unitPrice
  let discount = 0
  
  // Bulk discount tiers
  if (quantity >= 10) {
    discount = total * 0.15 // 15% off for 10+ items
  } else if (quantity >= 5) {
    discount = total * 0.10 // 10% off for 5+ items
  } else if (quantity >= 3) {
    discount = total * 0.05 // 5% off for 3+ items
  }
  
  return {
    discount,
    finalAmount: total - discount,
    discountPercentage: quantity >= 10 ? 15 : quantity >= 5 ? 10 : quantity >= 3 ? 5 : 0
  }
}

// Check referral discount eligibility
export const checkReferralDiscount = async (userId, referrerCode) => {
  try {
    // Check if user was referred
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists() && userDoc.data().referredBy === referrerCode) {
      return {
        eligible: true,
        discount: 100, // ₹100 discount for referred users
        message: 'Referral discount applied!'
      }
    }
    return { eligible: false }
  } catch (error) {
    console.error('Error checking referral:', error)
    return { eligible: false }
  }
}

