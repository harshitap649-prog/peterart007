import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const WISHLIST_FILE = path.join(process.cwd(), 'data', 'wishlist.json')

async function ensureDirectories() {
  if (!existsSync(path.join(process.cwd(), 'data'))) {
    await mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  }
}

async function readWishlist() {
  await ensureDirectories()
  try {
    if (existsSync(WISHLIST_FILE)) {
      const data = await readFile(WISHLIST_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading wishlist:', error)
    return []
  }
}

async function writeWishlist(wishlist: any[]) {
  await ensureDirectories()
  await writeFile(WISHLIST_FILE, JSON.stringify(wishlist, null, 2), 'utf-8')
}

// GET - Get user wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    const wishlist = await readWishlist()
    const userWishlist = wishlist
      .filter((item: any) => item.userId === userId)
      .map((item: any) => item.artworkId)
    
    return NextResponse.json(userWishlist)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, artworkId } = body
    
    if (!userId || !artworkId) {
      return NextResponse.json({ error: 'User ID and Artwork ID required' }, { status: 400 })
    }
    
    const wishlist = await readWishlist()
    const existingIndex = wishlist.findIndex(
      (item: any) => item.userId === userId && item.artworkId === artworkId
    )
    
    if (existingIndex === -1) {
      wishlist.push({
        userId,
        artworkId,
        createdAt: new Date().toISOString()
      })
      await writeWishlist(wishlist)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const artworkId = searchParams.get('artworkId')
    
    if (!userId || !artworkId) {
      return NextResponse.json({ error: 'User ID and Artwork ID required' }, { status: 400 })
    }
    
    const wishlist = await readWishlist()
    const filtered = wishlist.filter(
      (item: any) => !(item.userId === userId && item.artworkId === artworkId)
    )
    
    await writeWishlist(filtered)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}

// PUT - Check if in wishlist
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, artworkId } = body
    
    if (!userId || !artworkId) {
      return NextResponse.json({ error: 'User ID and Artwork ID required' }, { status: 400 })
    }
    
    const wishlist = await readWishlist()
    const exists = wishlist.some(
      (item: any) => item.userId === userId && item.artworkId === artworkId
    )
    
    return NextResponse.json({ exists })
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return NextResponse.json({ error: 'Failed to check wishlist' }, { status: 500 })
  }
}

