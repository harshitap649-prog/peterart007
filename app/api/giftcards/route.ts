import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { generateGiftCardCode } from '@/lib/giftcards'

const GIFTCARDS_FILE = path.join(process.cwd(), 'data', 'giftcards.json')

async function ensureDirectories() {
  if (!existsSync(path.join(process.cwd(), 'data'))) {
    await mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  }
}

async function readGiftCards() {
  await ensureDirectories()
  try {
    if (existsSync(GIFTCARDS_FILE)) {
      const data = await readFile(GIFTCARDS_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading gift cards:', error)
    return []
  }
}

async function writeGiftCards(giftCards: any[]) {
  await ensureDirectories()
  try {
    await writeFile(GIFTCARDS_FILE, JSON.stringify(giftCards, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing gift cards:', error)
    throw error
  }
}

// GET - Get gift cards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const code = searchParams.get('code')
    
    const giftCards = await readGiftCards()
    
    if (code) {
      // Get gift card by code
      const giftCard = giftCards.find((gc: any) => gc.code === code.toUpperCase())
      return NextResponse.json(giftCard ? [giftCard] : [])
    }
    
    if (userId) {
      // Get all gift cards for a user (both purchased and received)
      const userGiftCards = giftCards.filter(
        (gc: any) => gc.purchasedBy === userId || gc.recipientEmail === userId || gc.recipientUserId === userId
      )
      return NextResponse.json(userGiftCards)
    }
    
    return NextResponse.json(giftCards)
  } catch (error) {
    console.error('Error fetching gift cards:', error)
    return NextResponse.json({ error: 'Failed to fetch gift cards' }, { status: 500 })
  }
}

// POST - Purchase/Create gift card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      purchasedBy,
      purchasedByName,
      amount,
      recipientName,
      recipientEmail,
      recipientUserId,
      message,
      expiresInDays = 365 // Default 1 year expiry
    } = body
    
    if (!purchasedBy || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid gift card data' }, { status: 400 })
    }
    
    const giftCards = await readGiftCards()
    
    // Generate unique code
    let code = generateGiftCardCode()
    let attempts = 0
    while (giftCards.some((gc: any) => gc.code === code) && attempts < 10) {
      code = generateGiftCardCode()
      attempts++
    }
    
    if (attempts >= 10) {
      return NextResponse.json({ error: 'Failed to generate unique gift card code' }, { status: 500 })
    }
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    
    const newGiftCard = {
      id: Date.now().toString(),
      code: code,
      amount: parseFloat(amount),
      balance: parseFloat(amount),
      status: 'active',
      purchasedBy,
      purchasedByName: purchasedByName || 'Anonymous',
      purchasedAt: new Date().toISOString(),
      recipientName: recipientName || '',
      recipientEmail: recipientEmail || '',
      recipientUserId: recipientUserId || null,
      message: message || '',
      expiresAt: expiresAt.toISOString(),
      transactions: [] // Track usage history
    }
    
    giftCards.push(newGiftCard)
    await writeGiftCards(giftCards)
    
    return NextResponse.json(newGiftCard)
  } catch (error) {
    console.error('Error creating gift card:', error)
    return NextResponse.json({ error: 'Failed to create gift card' }, { status: 500 })
  }
}

// PUT - Update gift card (redeem, update balance)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, amount, orderId, action } = body
    
    if (!code) {
      return NextResponse.json({ error: 'Gift card code required' }, { status: 400 })
    }
    
    const giftCards = await readGiftCards()
    const giftCardIndex = giftCards.findIndex((gc: any) => gc.code === code.toUpperCase())
    
    if (giftCardIndex === -1) {
      return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })
    }
    
    const giftCard = giftCards[giftCardIndex]
    
    if (action === 'redeem') {
      // Redeem gift card (deduct from balance)
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Invalid redemption amount' }, { status: 400 })
      }
      
      if (giftCard.balance < amount) {
        return NextResponse.json({ error: 'Insufficient gift card balance' }, { status: 400 })
      }
      
      giftCard.balance -= amount
      giftCard.transactions.push({
        type: 'redeemed',
        amount: amount,
        orderId: orderId || null,
        date: new Date().toISOString()
      })
      
      if (giftCard.balance <= 0) {
        giftCard.status = 'used'
      }
    } else if (action === 'activate') {
      giftCard.status = 'active'
    } else if (action === 'deactivate') {
      giftCard.status = 'inactive'
    }
    
    giftCard.updatedAt = new Date().toISOString()
    giftCards[giftCardIndex] = giftCard
    await writeGiftCards(giftCards)
    
    return NextResponse.json(giftCard)
  } catch (error) {
    console.error('Error updating gift card:', error)
    return NextResponse.json({ error: 'Failed to update gift card' }, { status: 500 })
  }
}

