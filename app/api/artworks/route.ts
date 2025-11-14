import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/firebase.config'

const ARTWORKS_FILE = path.join(process.cwd(), 'data', 'artworks.json')
const ARTWORKS_DIR = path.join(process.cwd(), 'public', 'artworks')

// Ensure directories exist
async function ensureDirectories() {
  if (!existsSync(path.join(process.cwd(), 'data'))) {
    await mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  }
  if (!existsSync(ARTWORKS_DIR)) {
    await mkdir(ARTWORKS_DIR, { recursive: true })
  }
}

async function readArtworks() {
  await ensureDirectories()
  try {
    if (existsSync(ARTWORKS_FILE)) {
      const data = await readFile(ARTWORKS_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading artworks:', error)
    return []
  }
}

async function writeArtworks(artworks: any[]) {
  await ensureDirectories()
  try {
    // Write to file with error handling
    await writeFile(ARTWORKS_FILE, JSON.stringify(artworks, null, 2), 'utf-8')
    // Verify the write was successful
    const verify = await readFile(ARTWORKS_FILE, 'utf-8')
    const parsed = JSON.parse(verify)
    if (parsed.length !== artworks.length) {
      console.error('Artwork count mismatch after write!')
      throw new Error('Write verification failed')
    }
  } catch (error) {
    console.error('Error writing artworks file:', error)
    throw error
  }
}

// GET - Get all artworks
export async function GET() {
  try {
    const artworks = await readArtworks()
    return NextResponse.json(artworks)
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 })
  }
}

// POST - Add new artwork
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    
    const artworks = await readArtworks()
    const newId = Date.now().toString()
    
    // Handle image uploads - Use Firebase Storage for persistence
    const imageUrls: string[] = []
    const imageFiles = formData.getAll('images') as File[]
    
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        if (file && file.size > 0 && file.name) {
          try {
            // Upload to Firebase Storage
            const fileName = `artworks/${newId}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            const storageRef = ref(storage, fileName)
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            
            await uploadBytes(storageRef, buffer)
            const downloadURL = await getDownloadURL(storageRef)
            imageUrls.push(downloadURL)
          } catch (error) {
            console.error('Error uploading image to Firebase:', error)
            // Fallback to local storage if Firebase fails
            try {
              const bytes = await file.arrayBuffer()
              const buffer = Buffer.from(bytes)
              const fileName = `${newId}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
              const filePath = path.join(ARTWORKS_DIR, fileName)
              await writeFile(filePath, buffer)
              imageUrls.push(`/artworks/${fileName}`)
            } catch (fallbackError) {
              console.error('Error with fallback storage:', fallbackError)
            }
          }
        }
      }
    }
    
    if (imageUrls.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 })
    }
    
    const newArtwork = {
      id: newId,
      title,
      description,
      price,
      category: category || '',
      images: imageUrls,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      likedBy: []
    }
    
    artworks.push(newArtwork)
    await writeArtworks(artworks)

    return NextResponse.json(newArtwork)
  } catch (error) {
    console.error('Error adding artwork:', error)
    return NextResponse.json({ error: 'Failed to add artwork' }, { status: 500 })
  }
}

// PUT - Update artwork
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    
    const artworks = await readArtworks()
    const index = artworks.findIndex((a: any) => a.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    const existingArtwork = artworks[index]
    let imageUrls = existingArtwork.images || []
    
    // Handle new image uploads - Use Firebase Storage
    const imageFiles = formData.getAll('images') as File[]
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      if (file && file.size > 0) {
        try {
          // Upload to Firebase Storage
          const fileName = `artworks/${id}_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const storageRef = ref(storage, fileName)
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          await uploadBytes(storageRef, buffer)
          const downloadURL = await getDownloadURL(storageRef)
          imageUrls.push(downloadURL)
        } catch (error) {
          console.error('Error uploading image to Firebase:', error)
          // Fallback to local storage
          try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const fileName = `${id}_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            const filePath = path.join(ARTWORKS_DIR, fileName)
            await writeFile(filePath, buffer)
            imageUrls.push(`/artworks/${fileName}`)
          } catch (fallbackError) {
            console.error('Error with fallback storage:', fallbackError)
          }
        }
      }
    }
    
    artworks[index] = {
      ...existingArtwork,
      title,
      description,
      price,
      category: category || '',
      images: imageUrls,
      updatedAt: new Date().toISOString()
    }
    
    await writeArtworks(artworks)
    
    return NextResponse.json(artworks[index])
  } catch (error) {
    console.error('Error updating artwork:', error)
    return NextResponse.json({ error: 'Failed to update artwork' }, { status: 500 })
  }
}

// DELETE - Delete artwork
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Artwork ID required' }, { status: 400 })
    }
    
    const artworks = await readArtworks()
    const artwork = artworks.find((a: any) => a.id === id)
    
    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    // Delete image files from Firebase Storage or local storage
    if (artwork.images && artwork.images.length > 0) {
      for (const imageUrl of artwork.images) {
        try {
          // Check if it's a Firebase Storage URL
          if (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.includes('firebase')) {
            try {
              // Extract path from Firebase Storage URL
              // URL format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?alt=media&token=...
              const urlParts = imageUrl.split('/')
              const oIndex = urlParts.findIndex((part: string) => part === 'o')
              if (oIndex !== -1 && oIndex + 1 < urlParts.length) {
                const encodedPath = urlParts[oIndex + 1].split('?')[0]
                const decodedPath = decodeURIComponent(encodedPath)
                const storageRef = ref(storage, decodedPath)
                await deleteObject(storageRef)
              }
            } catch (firebaseError) {
              console.error('Error deleting from Firebase Storage:', firebaseError)
            }
          } else {
            // Delete from local storage
            const { unlink } = await import('fs/promises')
            const fileName = imageUrl.split('/').pop()
            if (fileName) {
              const filePath = path.join(ARTWORKS_DIR, fileName)
              if (existsSync(filePath)) {
                await unlink(filePath)
              }
            }
          }
        } catch (error) {
          console.error('Error deleting image file:', error)
          // Continue even if deletion fails
        }
      }
    }
    
    const filteredArtworks = artworks.filter((a: any) => a.id !== id)
    
    // Verify the artwork was actually removed
    if (filteredArtworks.length !== artworks.length - 1) {
      console.error('Artwork deletion verification failed!')
      return NextResponse.json({ error: 'Failed to delete artwork - verification failed' }, { status: 500 })
    }
    
    await writeArtworks(filteredArtworks)
    
    // Verify the write was successful
    const verify = await readArtworks()
    const stillExists = verify.find((a: any) => a.id === id)
    if (stillExists) {
      console.error('Artwork still exists after deletion!')
      return NextResponse.json({ error: 'Failed to delete artwork - still exists' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json({ error: 'Failed to delete artwork' }, { status: 500 })
  }
}

