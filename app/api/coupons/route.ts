import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, query, where, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.config'

// GET - Get all coupons or validate a coupon
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const userId = searchParams.get('userId')
    const cartTotal = parseFloat(searchParams.get('cartTotal') || '0')
    
    if (code) {
      // Validate coupon
      const couponsRef = collection(db, 'coupons')
      const q = query(couponsRef, where('code', '==', code.toUpperCase()))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return NextResponse.json({ valid: false, error: 'Invalid coupon code' }, { status: 400 })
      }
      
      const couponDoc = snapshot.docs[0]
      const couponData = couponDoc.data()
      const coupon = { id: couponDoc.id, ...couponData } as any
      
      // Validation checks
      if (!coupon.isActive) {
        return NextResponse.json({ valid: false, error: 'This coupon is not active' }, { status: 400 })
      }
      
      const now = new Date()
      if (coupon.validFrom && new Date(coupon.validFrom) > now) {
        return NextResponse.json({ valid: false, error: 'This coupon is not yet valid' }, { status: 400 })
      }
      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        return NextResponse.json({ valid: false, error: 'This coupon has expired' }, { status: 400 })
      }
      
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' }, { status: 400 })
      }
      
      if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
        return NextResponse.json({ 
          valid: false, 
          error: `Minimum order amount of ₹${coupon.minOrderAmount} required` 
        }, { status: 400 })
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
      
      return NextResponse.json({
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
      })
    }
    
    // Get all active coupons
    const couponsRef = collection(db, 'coupons')
    const snapshot = await getDocs(couponsRef)
    const coupons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    
    const now = new Date()
    const activeCoupons = coupons.filter((coupon: any) => {
      if (!coupon.isActive) return false
      if (coupon.validFrom && new Date(coupon.validFrom) > now) return false
      if (coupon.validUntil && new Date(coupon.validUntil) < now) return false
      return true
    })
    
    return NextResponse.json(activeCoupons)
  } catch (error) {
    console.error('Error handling coupon request:', error)
    return NextResponse.json({ error: 'Failed to process coupon request' }, { status: 500 })
  }
}

// POST - Create new coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      validFrom,
      validUntil,
      usageLimit,
      oneTimeUse,
      type,
      isActive
    } = body
    
    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: 'Code, discount type, and discount value are required' }, { status: 400 })
    }
    
    // Check if coupon code already exists
    const couponsRef = collection(db, 'coupons')
    const q = query(couponsRef, where('code', '==', code.toUpperCase()))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }
    
    const newCoupon = {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minOrderAmount: minOrderAmount || null,
      validFrom: validFrom || null,
      validUntil: validUntil || null,
      usageLimit: usageLimit || null,
      usedCount: 0,
      oneTimeUse: oneTimeUse || false,
      type: type || 'general',
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Create coupon document
    const couponRef = doc(collection(db, 'coupons'))
    await setDoc(couponRef, newCoupon)
    
    return NextResponse.json({ id: couponRef.id, ...newCoupon })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}

// PUT - Apply coupon
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, userId, orderId } = body
    
    if (!code || !userId) {
      return NextResponse.json({ error: 'Code and user ID are required' }, { status: 400 })
    }
    
    const couponsRef = collection(db, 'coupons')
    const q = query(couponsRef, where('code', '==', code.toUpperCase()))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
    }
    
    const couponDoc = snapshot.docs[0]
    const couponRef = doc(db, 'coupons', couponDoc.id)
    const couponData = couponDoc.data()
    
    // Update coupon usage
    await updateDoc(couponRef, {
      usedCount: (couponData.usedCount || 0) + 1,
      lastUsedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    // Record user coupon usage if one-time use
    if (couponData.oneTimeUse && orderId) {
      await setDoc(doc(db, 'userCoupons', `${userId}_${couponDoc.id}`), {
        userId,
        couponId: couponDoc.id,
        orderId,
        usedAt: new Date().toISOString()
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error applying coupon:', error)
    return NextResponse.json({ error: 'Failed to apply coupon' }, { status: 500 })
  }
}

