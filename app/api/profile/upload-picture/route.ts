import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc } from 'firebase/firestore'
// import { db } from '@/firebase.config'

// Placeholder
const db = null as any

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
    
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataURL = `data:${mimeType};base64,${base64Image}`
    
    // Update user profile in Firestore with base64 image
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      photoURL: dataURL,
      updatedAt: new Date().toISOString()
    })
    
    return NextResponse.json({ photoURL: dataURL })
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    return NextResponse.json({ error: 'Failed to upload profile picture' }, { status: 500 })
  }
}

