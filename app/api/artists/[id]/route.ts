import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ARTISTS_FILE = path.join(process.cwd(), 'data', 'artists.json')
const ARTWORKS_FILE = path.join(process.cwd(), 'data', 'artworks.json')
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')

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

async function readArtworks() {
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
  try {
    await writeFile(ARTWORKS_FILE, JSON.stringify(artworks, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing artworks:', error)
    throw error
  }
}

async function readOrders() {
  try {
    if (existsSync(ORDERS_FILE)) {
      const data = await readFile(ORDERS_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading orders:', error)
    return []
  }
}

// GET - Get artist by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artists = await readArtists()
    const artist = artists.find((a: any) => a.id === params.id)
    
    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }
    
    return NextResponse.json(artist)
  } catch (error) {
    console.error('Error fetching artist:', error)
    return NextResponse.json({ error: 'Failed to fetch artist' }, { status: 500 })
  }
}

// PUT - Update artist profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const artists = await readArtists()
    const artistIndex = artists.findIndex((a: any) => a.id === params.id)
    
    if (artistIndex === -1) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }
    
    artists[artistIndex] = {
      ...artists[artistIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    await writeArtists(artists)
    
    return NextResponse.json(artists[artistIndex])
  } catch (error) {
    console.error('Error updating artist:', error)
    return NextResponse.json({ error: 'Failed to update artist' }, { status: 500 })
  }
}

// DELETE - Delete artist and all their artworks
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artists = await readArtists()
    const artistIndex = artists.findIndex((a: any) => a.id === params.id)
    
    if (artistIndex === -1) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }
    
    const artist = artists[artistIndex]
    
    // Delete all artworks by this artist
    const artworks = await readArtworks()
    const artistArtworks = artworks.filter((a: any) => a.artistId === params.id)
    
    if (artistArtworks.length > 0) {
      const remainingArtworks = artworks.filter((a: any) => a.artistId !== params.id)
      await writeArtworks(remainingArtworks)
    }
    
    // Remove artist from list
    artists.splice(artistIndex, 1)
    await writeArtists(artists)
    
    return NextResponse.json({ 
      success: true, 
      message: `Artist and ${artistArtworks.length} artwork(s) deleted successfully`,
      deletedArtworksCount: artistArtworks.length
    })
  } catch (error) {
    console.error('Error deleting artist:', error)
    return NextResponse.json({ error: 'Failed to delete artist' }, { status: 500 })
  }
}

