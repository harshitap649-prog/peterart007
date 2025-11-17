import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ARTISTS_FILE = path.join(process.cwd(), 'data', 'artists.json')

async function ensureDirectories() {
  if (!existsSync(path.join(process.cwd(), 'data'))) {
    await mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  }
}

async function readArtists() {
  await ensureDirectories()
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
  await ensureDirectories()
  try {
    await writeFile(ARTISTS_FILE, JSON.stringify(artists, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing artists:', error)
    throw error
  }
}

// GET - Get all artists or filter by userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') // pending, approved, rejected
    
    const artists = await readArtists()
    
    let filtered = artists
    
    if (userId) {
      filtered = artists.filter((a: any) => a.userId === userId)
    }
    
    if (status) {
      filtered = filtered.filter((a: any) => a.status === status)
    }
    
    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
  }
}

// POST - Register new artist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      email,
      displayName,
      artistName,
      bio,
      portfolio,
      socialLinks,
      commissionRate = 70, // Default 70% to artist, 30% to platform
      bankDetails,
      documents
    } = body
    
    if (!userId || !email || !artistName) {
      return NextResponse.json({ error: 'User ID, email, and artist name are required' }, { status: 400 })
    }
    
    const artists = await readArtists()
    
    // Check if user is already registered as artist
    const existingArtist = artists.find((a: any) => a.userId === userId)
    if (existingArtist) {
      return NextResponse.json({ error: 'User is already registered as an artist' }, { status: 400 })
    }
    
    const newArtist = {
      id: Date.now().toString(),
      userId,
      email,
      displayName: displayName || email.split('@')[0],
      artistName,
      bio: bio || '',
      portfolio: portfolio || [],
      socialLinks: socialLinks || {
        website: '',
        instagram: '',
        facebook: '',
        twitter: ''
      },
      commissionRate: parseFloat(commissionRate) || 70,
      bankDetails: bankDetails || null,
      documents: documents || [],
      status: 'pending', // pending, approved, rejected
      verificationStatus: 'unverified', // unverified, verified, rejected
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Statistics
      totalArtworks: 0,
      totalSales: 0,
      totalRevenue: 0,
      totalEarnings: 0
    }
    
    artists.push(newArtist)
    await writeArtists(artists)
    
    return NextResponse.json(newArtist)
  } catch (error) {
    console.error('Error creating artist:', error)
    return NextResponse.json({ error: 'Failed to create artist' }, { status: 500 })
  }
}

// PUT - Update artist (admin approval, profile updates)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, verificationStatus, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 })
    }
    
    const artists = await readArtists()
    const artistIndex = artists.findIndex((a: any) => a.id === id)
    
    if (artistIndex === -1) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }
    
    const artist = artists[artistIndex]
    
    // Update artist
    artists[artistIndex] = {
      ...artist,
      ...updates,
      status: status || artist.status,
      verificationStatus: verificationStatus || artist.verificationStatus,
      updatedAt: new Date().toISOString()
    }
    
    await writeArtists(artists)
    
    return NextResponse.json(artists[artistIndex])
  } catch (error) {
    console.error('Error updating artist:', error)
    return NextResponse.json({ error: 'Failed to update artist' }, { status: 500 })
  }
}

