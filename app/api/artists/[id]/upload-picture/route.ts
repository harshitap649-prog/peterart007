import { NextRequest, NextResponse } from 'next/server'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/firebase.config'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ARTISTS_FILE = path.join(process.cwd(), 'data', 'artists.json')

async function readArtists() {
  try {
    if (existsSync(ARTISTS_FILE)) {
      const data = await readFile(ARTISTS_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading artists:', error)
    return []
  }
}

async function writeArtists(artists: any[]) {
  try {
    await writeFile(ARTISTS_FILE, JSON.stringify(artists, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing artists:', error)
    throw error
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 })
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
    const storageRef = ref(storage, `artist-profiles/${params.id}/${Date.now()}_${file.name}`)
    const bytes = await file.arrayBuffer()
    await uploadBytes(storageRef, bytes)
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef)
    
    // Update artist profile
    const artists = await readArtists()
    const artistIndex = artists.findIndex((a: any) => a.id === params.id)
    
    if (artistIndex === -1) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }
    
    artists[artistIndex] = {
      ...artists[artistIndex],
      profileImage: downloadURL,
      updatedAt: new Date().toISOString()
    }
    
    await writeArtists(artists)
    
    return NextResponse.json({ profileImage: downloadURL })
  } catch (error) {
    console.error('Error uploading artist profile picture:', error)
    return NextResponse.json({ error: 'Failed to upload profile picture' }, { status: 500 })
  }
}

