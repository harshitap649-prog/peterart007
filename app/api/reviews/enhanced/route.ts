import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const reviewsFilePath = path.join(process.cwd(), 'data', 'enhanced-reviews.json')
const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json')
const dataDir = path.join(process.cwd(), 'data')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readReviews() {
  try {
    ensureDataDir()
    if (!fs.existsSync(reviewsFilePath)) {
      return []
    }
    const data = fs.readFileSync(reviewsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeReviews(reviews: any[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2))
  } catch (error) {
    console.error('Error writing reviews:', error)
  }
}

function readOrders() {
  try {
    ensureDataDir()
    if (!fs.existsSync(ordersFilePath)) {
      return []
    }
    const data = fs.readFileSync(ordersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// GET - Get reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')
    const userId = searchParams.get('userId')
    const reviewId = searchParams.get('reviewId')
    
    const reviews = readReviews()
    
    if (reviewId) {
      const review = reviews.find((r: any) => r.id === reviewId)
      if (!review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      }
      return NextResponse.json(review)
    }
    
    if (artworkId) {
      const artworkReviews = reviews.filter((r: any) => r.artworkId === artworkId)
      return NextResponse.json(artworkReviews)
    }
    
    if (userId) {
      const userReviews = reviews.filter((r: any) => r.userId === userId)
      return NextResponse.json(userReviews)
    }
    
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error reading reviews:', error)
    return NextResponse.json({ error: 'Failed to read reviews' }, { status: 500 })
  }
}

// POST - Create enhanced review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      artworkId,
      orderId,
      rating,
      qualityRating,
      shippingRating,
      packagingRating,
      text,
      photos = [],
      helpfulCount = 0
    } = body
    
    if (!userId || !artworkId || !rating) {
      return NextResponse.json({ error: 'User ID, Artwork ID, and Rating are required' }, { status: 400 })
    }
    
    // Check if user has purchased this artwork (for verified purchase badge)
    const orders = readOrders()
    const hasPurchased = orders.some(
      (o: any) => o.userId === userId && 
      o.artworkId === artworkId && 
      o.status === 'delivered' &&
      (!orderId || o.id === orderId)
    )
    
    const reviews = readReviews()
    
    // Check if user already reviewed this artwork
    const existingReview = reviews.find(
      (r: any) => r.userId === userId && r.artworkId === artworkId
    )
    
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this artwork' }, { status: 400 })
    }
    
    const newReview = {
      id: Date.now().toString(),
      userId,
      artworkId,
      orderId: orderId || null,
      verifiedPurchase: hasPurchased,
      rating: parseFloat(rating),
      qualityRating: qualityRating ? parseFloat(qualityRating) : null,
      shippingRating: shippingRating ? parseFloat(shippingRating) : null,
      packagingRating: packagingRating ? parseFloat(packagingRating) : null,
      text: text || '',
      photos: photos || [],
      helpfulCount: helpfulCount || 0,
      helpfulVotes: [],
      artistResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    reviews.push(newReview)
    writeReviews(reviews)
    
    return NextResponse.json(newReview)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

// PUT - Update review (add artist response, vote helpful, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, artistResponse, helpfulVote, userId } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
    }
    
    const reviews = readReviews()
    const reviewIndex = reviews.findIndex((r: any) => r.id === id)
    
    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    
    const review = reviews[reviewIndex]
    
    if (artistResponse !== undefined) {
      // Artist responding to review
      review.artistResponse = artistResponse
      review.updatedAt = new Date().toISOString()
    }
    
    if (helpfulVote !== undefined && userId) {
      // User voting if review is helpful
      if (helpfulVote) {
        if (!review.helpfulVotes.includes(userId)) {
          review.helpfulVotes.push(userId)
          review.helpfulCount = review.helpfulVotes.length
        }
      } else {
        review.helpfulVotes = review.helpfulVotes.filter((uid: string) => uid !== userId)
        review.helpfulCount = review.helpfulVotes.length
      }
    }
    
    reviews[reviewIndex] = review
    writeReviews(reviews)
    
    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

