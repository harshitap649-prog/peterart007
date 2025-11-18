import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const followsFilePath = path.join(process.cwd(), 'data', 'follows.json')
const dataDir = path.join(process.cwd(), 'data')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readFollows() {
  try {
    ensureDataDir()
    if (!fs.existsSync(followsFilePath)) {
      return []
    }
    const data = fs.readFileSync(followsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeFollows(follows: any[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(followsFilePath, JSON.stringify(follows, null, 2))
  } catch (error) {
    console.error('Error writing follows:', error)
  }
}

// GET - Get follows (check if user follows artist, get followers/following)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const artistId = searchParams.get('artistId')
    const type = searchParams.get('type') || 'check' // check, followers, following
    
    const follows = readFollows()
    
    if (type === 'check') {
      // Check if user follows artist
      if (userId && artistId) {
        const follow = follows.find(
          (f: any) => f.userId === userId && f.artistId === artistId
        )
        return NextResponse.json({ isFollowing: !!follow })
      }
    } else if (type === 'followers') {
      // Get all followers of an artist
      if (artistId) {
        const artistFollowers = follows.filter((f: any) => f.artistId === artistId)
        return NextResponse.json(artistFollowers)
      }
    } else if (type === 'following') {
      // Get all artists a user follows
      if (userId) {
        const userFollowing = follows.filter((f: any) => f.userId === userId)
        return NextResponse.json(userFollowing)
      }
    }
    
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  } catch (error) {
    console.error('Error reading follows:', error)
    return NextResponse.json({ error: 'Failed to read follows' }, { status: 500 })
  }
}

// POST - Follow an artist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, artistId } = body
    
    if (!userId || !artistId) {
      return NextResponse.json({ error: 'User ID and Artist ID are required' }, { status: 400 })
    }
    
    const follows = readFollows()
    
    // Check if already following
    const existingFollow = follows.find(
      (f: any) => f.userId === userId && f.artistId === artistId
    )
    
    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this artist' }, { status: 400 })
    }
    
    const newFollow = {
      id: Date.now().toString(),
      userId,
      artistId,
      createdAt: new Date().toISOString()
    }
    
    follows.push(newFollow)
    writeFollows(follows)
    
    return NextResponse.json(newFollow)
  } catch (error) {
    console.error('Error creating follow:', error)
    return NextResponse.json({ error: 'Failed to follow artist' }, { status: 500 })
  }
}

// DELETE - Unfollow an artist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const artistId = searchParams.get('artistId')
    
    if (!userId || !artistId) {
      return NextResponse.json({ error: 'User ID and Artist ID are required' }, { status: 400 })
    }
    
    const follows = readFollows()
    const filteredFollows = follows.filter(
      (f: any) => !(f.userId === userId && f.artistId === artistId)
    )
    
    writeFollows(filteredFollows)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting follow:', error)
    return NextResponse.json({ error: 'Failed to unfollow artist' }, { status: 500 })
  }
}

