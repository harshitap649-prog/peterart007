import { NextRequest, NextResponse } from 'next/server'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { storage, db } from '@/firebase.config'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    
    if (!file || !userId) {
      return NextResponse.json({ error: 'File and User ID required' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `profile-pictures/${userId}/${Date.now()}_${file.name}`)
    const bytes = await file.arrayBuffer()
    await uploadBytes(storageRef, bytes)
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef)
    
    // Update user profile in Firestore
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      photoURL: downloadURL,
      updatedAt: new Date().toISOString()
    })
    
    return NextResponse.json({ photoURL: downloadURL })
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    return NextResponse.json({ error: 'Failed to upload profile picture' }, { status: 500 })
  }
}

