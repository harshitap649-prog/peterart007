import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase.config'

export const dynamic = 'force-dynamic'

// GET - Get user profile
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
    
    return NextResponse.json(userDoc.data())
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...profileData } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    })
    
    const updatedDoc = await getDoc(userRef)
    return NextResponse.json(updatedDoc.data())
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

