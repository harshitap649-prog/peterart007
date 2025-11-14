import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ARTWORKS_FILE = path.join(process.cwd(), 'data', 'artworks.json')
const REVIEWS_DIR = path.join(process.cwd(), 'public', 'reviews')

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

async function ensureDirectories() {
  if (!existsSync(REVIEWS_DIR)) {
    await mkdir(REVIEWS_DIR, { recursive: true })
  }
}

async function readArtworks() {
  try {
    if (existsSync(ARTWORKS_FILE)) {
      const data = await readFile(ARTWORKS_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    return []
  }
}

async function writeArtworks(artworks: any[]) {
  await writeFile(ARTWORKS_FILE, JSON.stringify(artworks, null, 2), 'utf-8')
}

// POST - Add comment/review to artwork
export async function POST(request: NextRequest) {
  try {
    await ensureDirectories()
    
    const formData = await request.formData()
    const artworkId = formData.get('artworkId') as string
    const userId = formData.get('userId') as string
    const userName = formData.get('userName') as string
    const userEmail = formData.get('userEmail') as string
    const text = formData.get('text') as string
    const rating = formData.get('rating') ? parseInt(formData.get('rating') as string) : null
    
    const artworks = await readArtworks()
    const index = artworks.findIndex((a: any) => a.id === artworkId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    if (!artworks[index].comments) {
      artworks[index].comments = []
    }
    
    // Handle review images - Use Imgur (free, no authentication)
    const imageUrls: string[] = []
    const imageFiles = formData.getAll('images') as File[]
    
    if (imageFiles && imageFiles.length > 0) {
      const reviewId = Date.now().toString()
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        if (file && file.size > 0 && file.name) {
          try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const fileName = `${reviewId}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            
            // Upload to Imgur
            const imgurUrl = await uploadToImgur(buffer, fileName)
            if (imgurUrl) {
              imageUrls.push(imgurUrl)
            } else {
              // Fallback to local storage if Imgur fails
              const filePath = path.join(REVIEWS_DIR, fileName)
              await writeFile(filePath, buffer)
              imageUrls.push(`/reviews/${fileName}`)
            }
          } catch (error) {
            console.error('Error uploading review image:', error)
            // Final fallback to local storage
            try {
              const bytes = await file.arrayBuffer()
              const buffer = Buffer.from(bytes)
              const fileName = `${reviewId}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
              const filePath = path.join(REVIEWS_DIR, fileName)
              await writeFile(filePath, buffer)
              imageUrls.push(`/reviews/${fileName}`)
            } catch (fallbackError) {
              console.error('Error with fallback storage:', fallbackError)
            }
          }
        }
      }
    }
    
    const newComment = {
      id: Date.now().toString(),
      userId,
      userName,
      userEmail,
      text,
      rating: rating || null,
      images: imageUrls,
      createdAt: new Date().toISOString()
    }
    
    artworks[index].comments.push(newComment)
    
    // Calculate average rating
    if (rating) {
      const ratings = artworks[index].comments
        .filter((c: any) => c.rating)
        .map((c: any) => c.rating)
      artworks[index].averageRating = ratings.length > 0
        ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
        : null
      artworks[index].totalRatings = ratings.length
    }
    
    await writeArtworks(artworks)
    
    return NextResponse.json(newComment)
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}

// PUT - Like/unlike artwork
export async function PUT(request: NextRequest) {
  try {
    const { artworkId, userId } = await request.json()
    
    const artworks = await readArtworks()
    const index = artworks.findIndex((a: any) => a.id === artworkId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    if (!artworks[index].likedBy) {
      artworks[index].likedBy = []
    }
    
    const likedBy = artworks[index].likedBy || []
    const isLiked = likedBy.includes(userId)
    
    if (isLiked) {
      artworks[index].likedBy = likedBy.filter((id: string) => id !== userId)
      artworks[index].likes = (artworks[index].likes || 0) - 1
    } else {
      artworks[index].likedBy = [...likedBy, userId]
      artworks[index].likes = (artworks[index].likes || 0) + 1
    }
    
    await writeArtworks(artworks)
    
    return NextResponse.json({ 
      liked: !isLiked, 
      likes: artworks[index].likes 
    })
  } catch (error) {
    console.error('Error updating like:', error)
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 })
  }
}

