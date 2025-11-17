import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
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
    console.error('Error reading artworks:', error)
    return []
  }
}

async function writeArtworks(artworks: any[]) {
  await writeFile(ARTWORKS_FILE, JSON.stringify(artworks, null, 2), 'utf-8')
}

// GET - Get artwork by ID (check if artist is approved)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const includePending = searchParams.get('includePending') === 'true' // For admin use
    
    const artworks = await readArtworks()
    const artwork = artworks.find((a: any) => a.id === params.id)
    
    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    // If not admin request, check if artist is approved
    if (!includePending && artwork.artistId) {
      const { readFile } = await import('fs/promises')
      const { existsSync } = await import('fs')
      const artistsFile = path.join(process.cwd(), 'data', 'artists.json')
      
      if (existsSync(artistsFile)) {
        const artistsData = await readFile(artistsFile, 'utf-8')
        const artists = JSON.parse(artistsData)
        const artist = artists.find((a: any) => a.id === artwork.artistId)
        
        if (!artist || artist.status !== 'approved') {
          return NextResponse.json({ error: 'Artwork not available' }, { status: 403 })
        }
      }
    }
    
    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json({ error: 'Failed to fetch artwork' }, { status: 500 })
  }
}

