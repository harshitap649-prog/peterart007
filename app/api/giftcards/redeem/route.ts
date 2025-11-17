import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const GIFTCARDS_FILE = path.join(process.cwd(), 'data', 'giftcards.json')

async function readGiftCards() {
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
  try {
    await writeFile(GIFTCARDS_FILE, JSON.stringify(giftCards, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing gift cards:', error)
    throw error
  }
}

// POST - Redeem gift card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, orderId, amount } = body
    
    if (!code) {
      return NextResponse.json({ error: 'Gift card code required' }, { status: 400 })
    }
    
    const giftCards = await readGiftCards()
    const giftCardIndex = giftCards.findIndex((gc: any) => gc.code === code.toUpperCase())
    
    if (giftCardIndex === -1) {
      return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })
    }
    
    const giftCard = giftCards[giftCardIndex]
    
    // Validate gift card
    if (giftCard.status !== 'active') {
      return NextResponse.json({ error: 'Gift card is not active' }, { status: 400 })
    }
    
    if (giftCard.balance <= 0) {
      return NextResponse.json({ error: 'Gift card has no balance' }, { status: 400 })
    }
    
    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Gift card has expired' }, { status: 400 })
    }
    
    // Calculate redemption amount
    const redeemAmount = amount ? Math.min(amount, giftCard.balance) : giftCard.balance
    
    // Update balance
    giftCard.balance -= redeemAmount
    giftCard.transactions = giftCard.transactions || []
    giftCard.transactions.push({
      type: 'redeemed',
      amount: redeemAmount,
      orderId: orderId || null,
      date: new Date().toISOString()
    })
    
    if (giftCard.balance <= 0) {
      giftCard.status = 'used'
    }
    
    giftCard.updatedAt = new Date().toISOString()
    giftCards[giftCardIndex] = giftCard
    await writeGiftCards(giftCards)
    
    return NextResponse.json({
      success: true,
      giftCard,
      redeemedAmount: redeemAmount,
      remainingBalance: giftCard.balance
    })
  } catch (error) {
    console.error('Error redeeming gift card:', error)
    return NextResponse.json({ error: 'Failed to redeem gift card' }, { status: 500 })
  }
}

