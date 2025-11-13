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

// GET - Get artwork by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artworks = await readArtworks()
    const artwork = artworks.find((a: any) => a.id === params.id)
    
    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json({ error: 'Failed to fetch artwork' }, { status: 500 })
  }
}

