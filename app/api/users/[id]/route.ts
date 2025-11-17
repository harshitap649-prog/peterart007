import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase.config'

// GET - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    return NextResponse.json({
      uid: userDoc.id,
      email: userData.email,
      displayName: userData.displayName || userData.name || null,
      ...userData
    })
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}

// PUT - Disable/Enable user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { disabled } = await request.json()
    const userId = params.id

    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await updateDoc(userRef, {
      disabled: disabled === true,
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true, disabled })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE - Delete user from Firestore
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user document from Firestore
    await deleteDoc(userRef)

    // Note: To delete from Firebase Authentication, you would need Firebase Admin SDK
    // For now, we're only deleting from Firestore
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

