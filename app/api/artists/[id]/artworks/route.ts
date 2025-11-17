import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
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

// GET - Get artist's artworks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artworks = await readArtworks()
    const artistArtworks = artworks.filter((a: any) => a.artistId === params.id)
    
    return NextResponse.json(artistArtworks)
  } catch (error) {
    console.error('Error fetching artist artworks:', error)
    return NextResponse.json({ error: 'Failed to fetch artist artworks' }, { status: 500 })
  }
}

