import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite'
// import { db } from '@/firebase.config'

// Placeholder
const db = null as any

// GET - Get saved addresses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const addresses = userDoc.data().addresses || []
    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

// POST - Add new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...address } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const currentData = userDoc.data()
    const addresses = currentData.addresses || []
    
    const newAddress = {
      id: Date.now().toString(),
      ...address,
      createdAt: new Date().toISOString()
    }
    
    // If this is the first address or marked as default, set it as default
    if (addresses.length === 0 || address.isDefault) {
      newAddress.isDefault = true
      addresses.forEach((addr: any) => {
        addr.isDefault = false
      })
    }
    
    addresses.push(newAddress)
    
    await updateDoc(userRef, {
      addresses,
      updatedAt: new Date().toISOString()
    })
    
    return NextResponse.json(newAddress)
  } catch (error) {
    console.error('Error adding address:', error)
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 })
  }
}

// PUT - Update address
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, addressId, ...addressData } = body
    
    if (!userId || !addressId) {
      return NextResponse.json({ error: 'User ID and Address ID required' }, { status: 400 })
    }
    
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const currentData = userDoc.data()
    const addresses = currentData.addresses || []
    const index = addresses.findIndex((addr: any) => addr.id === addressId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }
    
    // If setting as default, remove default from others
    if (addressData.isDefault) {
      addresses.forEach((addr: any) => {
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
    
    return NextResponse.json(addresses[index])
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

// DELETE - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const addressId = searchParams.get('addressId')
    
    if (!userId || !addressId) {
      return NextResponse.json({ error: 'User ID and Address ID required' }, { status: 400 })
    }
    
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const currentData = userDoc.data()
    const addresses = (currentData.addresses || []).filter((addr: any) => addr.id !== addressId)
    
    await updateDoc(userRef, {
      addresses,
      updatedAt: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}

