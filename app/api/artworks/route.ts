import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ARTWORKS_FILE = path.join(process.cwd(), 'data', 'artworks.json')
const ARTWORKS_DIR = path.join(process.cwd(), 'public', 'artworks')

// Upload image to Imgur (free, no authentication required)
async function uploadToImgur(imageBuffer: Buffer, fileName: string): Promise<string | null> {
  try {
    const base64Image = imageBuffer.toString('base64')
    
    const formData = new URLSearchParams()
    formData.append('image', base64Image)
    formData.append('type', 'base64')

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7', // Imgur's public client ID for anonymous uploads
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Imgur upload failed:', errorText)
      return null
    }

    const data = await response.json()
    if (data.success && data.data && data.data.link) {
      return data.data.link
    }
    return null
  } catch (error) {
    console.error('Error uploading to Imgur:', error)
    return null
  }
}

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

// GET - Get all artworks (only from approved artists for public access)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includePending = searchParams.get('includePending') === 'true' // For admin use
    
    const artworks = await readArtworks()
    
    // If not admin request, filter out artworks from unapproved artists
    if (!includePending) {
      const { readFile } = await import('fs/promises')
      const { existsSync } = await import('fs')
      const artistsFile = path.join(process.cwd(), 'data', 'artists.json')
      
      if (existsSync(artistsFile)) {
        const artistsData = await readFile(artistsFile, 'utf-8')
        const artists = JSON.parse(artistsData)
        
        // Filter artworks to only include those from approved artists or no artist
        const filteredArtworks = artworks.filter((artwork: any) => {
          if (!artwork.artistId) {
            return true // Platform artworks are always visible
          }
          const artist = artists.find((a: any) => a.id === artwork.artistId)
          return artist && artist.status === 'approved'
        })
        
        return NextResponse.json(filteredArtworks)
      }
    }
    
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
    const artistId = formData.get('artistId') as string || null
    
    const artworks = await readArtworks()
    const newId = Date.now().toString()
    
    // Handle image uploads - Use Imgur (free, no authentication)
    const imageUrls: string[] = []
    const imageFiles = formData.getAll('images') as File[]
    
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        if (file && file.size > 0 && file.name) {
          try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const fileName = `${newId}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            
            // Upload to Imgur
            const imgurUrl = await uploadToImgur(buffer, fileName)
            if (imgurUrl) {
              imageUrls.push(imgurUrl)
            } else {
              // Fallback to local storage if Imgur fails
              const filePath = path.join(ARTWORKS_DIR, fileName)
              await writeFile(filePath, buffer)
              imageUrls.push(`/artworks/${fileName}`)
            }
          } catch (error) {
            console.error('Error uploading image:', error)
            // Final fallback to local storage
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
      artistId: artistId || null,
      artistCommissionRate: null, // Will be set from artist profile if artistId exists
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      likedBy: []
    }
    
    // If artistId is provided, get artist commission rate
    if (artistId) {
      const { readFile } = await import('fs/promises')
      const { existsSync } = await import('fs')
      const artistsFile = path.join(process.cwd(), 'data', 'artists.json')
      if (existsSync(artistsFile)) {
        try {
          const artistsData = await readFile(artistsFile, 'utf-8')
          const artists = JSON.parse(artistsData)
          const artist = artists.find((a: any) => a.id === artistId && a.status === 'approved')
          if (artist) {
            newArtwork.artistCommissionRate = artist.commissionRate || 70
          }
        } catch (error) {
          console.error('Error fetching artist commission:', error)
        }
      }
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
    
    if (!id) {
      return NextResponse.json({ error: 'Artwork ID is required' }, { status: 400 })
    }
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const priceStr = formData.get('price') as string
    const category = formData.get('category') as string
    const artistId = formData.get('artistId') as string || null
    
    if (!title || !description || !priceStr) {
      return NextResponse.json({ error: 'Title, description, and price are required' }, { status: 400 })
    }
    
    const price = parseFloat(priceStr)
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }
    
    const artworks = await readArtworks()
    const index = artworks.findIndex((a: any) => a.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    const existingArtwork = artworks[index]
    
    // Get images to keep from form data (if provided)
    const imagesToKeepStr = formData.get('imagesToKeep') as string
    let imageUrls: string[] = []
    
    if (imagesToKeepStr) {
      try {
        // Use the provided list of images to keep
        imageUrls = JSON.parse(imagesToKeepStr)
      } catch (error) {
        console.error('Error parsing imagesToKeep:', error)
        // Fallback to keeping all existing images
        imageUrls = [...(existingArtwork.images || [])]
      }
    } else {
      // If no imagesToKeep provided, preserve all existing images (backward compatibility)
      imageUrls = [...(existingArtwork.images || [])]
    }
    
    // Handle new image uploads - Use Imgur
    const imageFiles = formData.getAll('images') as File[]
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        // Check if it's actually a File object and has content
        if (file && file instanceof File && file.size > 0 && file.name) {
          try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const fileName = `${id}_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            
            // Upload to Imgur
            const imgurUrl = await uploadToImgur(buffer, fileName)
            if (imgurUrl) {
              imageUrls.push(imgurUrl)
            } else {
              // Fallback to local storage if Imgur fails
              const filePath = path.join(ARTWORKS_DIR, fileName)
              await writeFile(filePath, buffer)
              imageUrls.push(`/artworks/${fileName}`)
            }
          } catch (error) {
            console.error('Error uploading image:', error)
            // Final fallback to local storage
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
    }
    
    // Ensure we have at least one image (keep existing if no new ones uploaded)
    if (imageUrls.length === 0) {
      return NextResponse.json({ error: 'Artwork must have at least one image' }, { status: 400 })
    }
    
    // Update artist commission rate if artistId changed
    let artistCommissionRate = existingArtwork.artistCommissionRate || null
    if (artistId && artistId !== existingArtwork.artistId) {
      const { readFile } = await import('fs/promises')
      const { existsSync } = await import('fs')
      const artistsFile = path.join(process.cwd(), 'data', 'artists.json')
      if (existsSync(artistsFile)) {
        try {
          const artistsData = await readFile(artistsFile, 'utf-8')
          const artists = JSON.parse(artistsData)
          const artist = artists.find((a: any) => a.id === artistId && a.status === 'approved')
          if (artist) {
            artistCommissionRate = artist.commissionRate || 70
          }
        } catch (error) {
          console.error('Error fetching artist commission:', error)
        }
      }
    } else if (!artistId) {
      artistCommissionRate = null
    }
    
    // Update the artwork
    artworks[index] = {
      ...existingArtwork,
      title: title.trim(),
      description: description.trim(),
      price,
      category: (category || '').trim(),
      images: imageUrls,
      artistId: artistId || null,
      artistCommissionRate,
      updatedAt: new Date().toISOString()
    }
    
    await writeArtworks(artworks)
    
    return NextResponse.json(artworks[index])
  } catch (error: any) {
    console.error('Error updating artwork:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to update artwork' 
    }, { status: 500 })
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
    
    // Delete image files from local storage (Imgur images don't need deletion)
    if (artwork.images && artwork.images.length > 0) {
      for (const imageUrl of artwork.images) {
        try {
          // Only delete local files, Imgur images are permanent and don't need deletion
          if (imageUrl.startsWith('/artworks/')) {
            const { unlink } = await import('fs/promises')
            const fileName = imageUrl.split('/').pop()
            if (fileName) {
              const filePath = path.join(ARTWORKS_DIR, fileName)
              if (existsSync(filePath)) {
                await unlink(filePath)
              }
            }
          }
          // Imgur URLs (i.imgur.com) don't need deletion - they're permanent
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

