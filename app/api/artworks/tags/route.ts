import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const tagsFilePath = path.join(process.cwd(), 'data', 'artwork-tags.json')
const artworksFilePath = path.join(process.cwd(), 'data', 'artworks.json')
const dataDir = path.join(process.cwd(), 'data')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readTags() {
  try {
    ensureDataDir()
    if (!fs.existsSync(tagsFilePath)) {
      return []
    }
    const data = fs.readFileSync(tagsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeTags(tags: any[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(tagsFilePath, JSON.stringify(tags, null, 2))
  } catch (error) {
    console.error('Error writing tags:', error)
  }
}

function readArtworks() {
  try {
    ensureDataDir()
    if (!fs.existsSync(artworksFilePath)) {
      return []
    }
    const data = fs.readFileSync(artworksFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeArtworks(artworks: any[]) {
  fs.writeFileSync(artworksFilePath, JSON.stringify(artworks, null, 2))
}

// GET - Get tags for artwork or all tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')
    const tag = searchParams.get('tag') // Search artworks by tag
    
    const tags = readTags()
    
    if (artworkId) {
      const artworkTags = tags.filter((t: any) => t.artworkId === artworkId)
      return NextResponse.json(artworkTags)
    }
    
    if (tag) {
      // Get all artworks with this tag
      const artworks = readArtworks()
      const taggedArtworkIds = tags
        .filter((t: any) => t.tag.toLowerCase().includes(tag.toLowerCase()))
        .map((t: any) => t.artworkId)
      const taggedArtworks = artworks.filter((a: any) => taggedArtworkIds.includes(a.id))
      return NextResponse.json(taggedArtworks)
    }
    
    // Get all unique tags with counts
    const tagCounts: { [key: string]: number } = {}
    tags.forEach((t: any) => {
      tagCounts[t.tag] = (tagCounts[t.tag] || 0) + 1
    })
    
    const uniqueTags = Object.keys(tagCounts).map((tag: string) => ({
      tag,
      count: tagCounts[tag]
    }))
    
    return NextResponse.json(uniqueTags.sort((a: any, b: any) => b.count - a.count))
  } catch (error) {
    console.error('Error reading tags:', error)
    return NextResponse.json({ error: 'Failed to read tags' }, { status: 500 })
  }
}

// POST - Add tag to artwork
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artworkId, tag, userId } = body
    
    if (!artworkId || !tag) {
      return NextResponse.json({ error: 'Artwork ID and tag are required' }, { status: 400 })
    }
    
    const tags = readTags()
    const normalizedTag = tag.trim().toLowerCase()
    
    // Check if tag already exists for this artwork
    const existingTag = tags.find(
      (t: any) => t.artworkId === artworkId && t.tag === normalizedTag
    )
    
    if (existingTag) {
      return NextResponse.json({ error: 'Tag already exists for this artwork' }, { status: 400 })
    }
    
    const newTag = {
      id: Date.now().toString(),
      artworkId,
      tag: normalizedTag,
      userId: userId || null,
      createdAt: new Date().toISOString()
    }
    
    tags.push(newTag)
    writeTags(tags)
    
    return NextResponse.json(newTag)
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 })
  }
}

// DELETE - Remove tag from artwork
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const artworkId = searchParams.get('artworkId')
    const tag = searchParams.get('tag')
    
    const tags = readTags()
    let filteredTags
    
    if (id) {
      filteredTags = tags.filter((t: any) => t.id !== id)
    } else if (artworkId && tag) {
      filteredTags = tags.filter(
        (t: any) => !(t.artworkId === artworkId && t.tag === tag.toLowerCase())
      )
    } else {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }
    
    writeTags(filteredTags)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: 'Failed to remove tag' }, { status: 500 })
  }
}

