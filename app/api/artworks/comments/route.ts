import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ARTWORKS_FILE = path.join(process.cwd(), 'data', 'artworks.json')

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

// POST - Add comment to artwork
export async function POST(request: NextRequest) {
  try {
    const { artworkId, comment } = await request.json()
    
    const artworks = await readArtworks()
    const index = artworks.findIndex((a: any) => a.id === artworkId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    if (!artworks[index].comments) {
      artworks[index].comments = []
    }
    
    const newComment = {
      id: Date.now().toString(),
      ...comment,
      createdAt: new Date().toISOString()
    }
    
    artworks[index].comments.push(newComment)
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

