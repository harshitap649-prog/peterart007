import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const collectionsFilePath = path.join(process.cwd(), 'data', 'collections.json')

function readCollections() {
  try {
    const data = fs.readFileSync(collectionsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeCollections(collections: any[]) {
  fs.writeFileSync(collectionsFilePath, JSON.stringify(collections, null, 2))
}

// GET - Get collections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const collectionId = searchParams.get('collectionId')
    const isPublic = searchParams.get('isPublic')
    
    const collections = readCollections()
    
    if (collectionId) {
      const collection = collections.find((c: any) => c.id === collectionId)
      if (!collection) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
      }
      // Check if user can view (owner or public)
      if (collection.userId !== userId && !collection.isPublic) {
        return NextResponse.json({ error: 'Collection is private' }, { status: 403 })
      }
      return NextResponse.json(collection)
    }
    
    if (userId) {
      const userCollections = collections.filter((c: any) => c.userId === userId)
      return NextResponse.json(userCollections)
    }
    
    if (isPublic === 'true') {
      const publicCollections = collections.filter((c: any) => c.isPublic === true)
      return NextResponse.json(publicCollections)
    }
    
    return NextResponse.json(collections)
  } catch (error) {
    console.error('Error reading collections:', error)
    return NextResponse.json({ error: 'Failed to read collections' }, { status: 500 })
  }
}

// POST - Create collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, description, isPublic = false, artworkIds = [] } = body
    
    if (!userId || !name) {
      return NextResponse.json({ error: 'User ID and name are required' }, { status: 400 })
    }
    
    const collections = readCollections()
    
    const newCollection = {
      id: Date.now().toString(),
      userId,
      name,
      description: description || '',
      isPublic: isPublic === true,
      artworkIds: artworkIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    collections.push(newCollection)
    writeCollections(collections)
    
    return NextResponse.json(newCollection)
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
  }
}

// PUT - Update collection
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userId, name, description, isPublic, artworkIds } = body
    
    if (!id || !userId) {
      return NextResponse.json({ error: 'Collection ID and User ID are required' }, { status: 400 })
    }
    
    const collections = readCollections()
    const collectionIndex = collections.findIndex((c: any) => c.id === id)
    
    if (collectionIndex === -1) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }
    
    const collection = collections[collectionIndex]
    if (collection.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    collections[collectionIndex] = {
      ...collection,
      name: name || collection.name,
      description: description !== undefined ? description : collection.description,
      isPublic: isPublic !== undefined ? isPublic : collection.isPublic,
      artworkIds: artworkIds !== undefined ? artworkIds : collection.artworkIds,
      updatedAt: new Date().toISOString()
    }
    
    writeCollections(collections)
    
    return NextResponse.json(collections[collectionIndex])
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 })
  }
}

// DELETE - Delete collection
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')
    
    if (!id || !userId) {
      return NextResponse.json({ error: 'Collection ID and User ID are required' }, { status: 400 })
    }
    
    const collections = readCollections()
    const collection = collections.find((c: any) => c.id === id)
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }
    
    if (collection.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const filteredCollections = collections.filter((c: any) => c.id !== id)
    writeCollections(filteredCollections)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
  }
}

