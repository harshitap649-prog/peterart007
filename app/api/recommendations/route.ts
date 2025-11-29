import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { 
  getPersonalizedRecommendations, 
  getTrendingArtworks, 
  getSimilarArtworks,
  getBecauseYouLiked 
} from '@/lib/recommendations'

export const dynamic = 'force-dynamic'

const ARTWORKS_FILE = path.join(process.cwd(), 'data', 'artworks.json')
const WISHLIST_FILE = path.join(process.cwd(), 'data', 'wishlist.json')
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')

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

async function readWishlist() {
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

// GET - Get recommendations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'personalized' // personalized, trending, similar, becauseYouLiked
    const artworkId = searchParams.get('artworkId')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const artworks = await readArtworks()
    
    if (artworks.length === 0) {
      return NextResponse.json([])
    }
    
    let recommendations = []
    
    switch (type) {
      case 'trending':
        recommendations = getTrendingArtworks(artworks, limit)
        break
        
      case 'similar':
        if (!artworkId) {
          return NextResponse.json({ error: 'artworkId required for similar recommendations' }, { status: 400 })
        }
        recommendations = getSimilarArtworks(artworkId, artworks, limit)
        break
        
      case 'becauseYouLiked':
        if (!userId) {
          return NextResponse.json({ error: 'userId required for becauseYouLiked recommendations' }, { status: 400 })
        }
        const wishlist = await readWishlist()
        const orders = await readOrders()
        const userWishlist = wishlist.filter((item: any) => item.userId === userId)
        const userOrders = orders.filter((order: any) => order.userId === userId && order.status !== 'cancelled')
        recommendations = getBecauseYouLiked(userId, artworks, userWishlist, userOrders, limit)
        break
        
      case 'personalized':
      default:
        if (!userId) {
          // If no userId, return trending
          recommendations = getTrendingArtworks(artworks, limit)
        } else {
          const wishlist = await readWishlist()
          const orders = await readOrders()
          const userWishlist = wishlist.filter((item: any) => item.userId === userId)
          const userOrders = orders.filter((order: any) => order.userId === userId && order.status !== 'cancelled')
          
          // Get user views from artworks (views are stored per artwork)
          const views = artworks
            .filter((a: any) => a.views && a.views > 0)
            .map((a: any) => ({ artworkId: a.id, count: a.views || 0 }))
          
          recommendations = getPersonalizedRecommendations(
            userId, 
            artworks, 
            userWishlist, 
            userOrders, 
            views, 
            limit
          )
        }
        break
    }
    
    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}

