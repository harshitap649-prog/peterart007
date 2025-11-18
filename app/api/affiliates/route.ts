import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const affiliatesFilePath = path.join(process.cwd(), 'data', 'affiliates.json')
const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json')
const dataDir = path.join(process.cwd(), 'data')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readAffiliates() {
  try {
    ensureDataDir()
    if (!fs.existsSync(affiliatesFilePath)) {
      return []
    }
    const data = fs.readFileSync(affiliatesFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeAffiliates(affiliates: any[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(affiliatesFilePath, JSON.stringify(affiliates, null, 2))
  } catch (error) {
    console.error('Error writing affiliates:', error)
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

// GET - Get affiliate info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const referralCode = searchParams.get('referralCode')
    
    const affiliates = readAffiliates()
    
    if (referralCode) {
      const affiliate = affiliates.find((a: any) => a.referralCode === referralCode)
      if (!affiliate) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
      }
      return NextResponse.json(affiliate)
    }
    
    if (userId) {
      const affiliate = affiliates.find((a: any) => a.userId === userId)
      if (!affiliate) {
        return NextResponse.json({ error: 'Not an affiliate' }, { status: 404 })
      }
      
      // Calculate earnings
      const orders = readOrders()
      const referredOrders = orders.filter((o: any) => o.referralCode === affiliate.referralCode)
      const totalEarnings = referredOrders.reduce((sum: number, o: any) => {
        return sum + (o.total * (affiliate.commissionRate / 100))
      }, 0)
      
      return NextResponse.json({
        ...affiliate,
        totalReferrals: referredOrders.length,
        totalEarnings,
        pendingEarnings: totalEarnings - (affiliate.paidEarnings || 0)
      })
    }
    
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  } catch (error) {
    console.error('Error reading affiliates:', error)
    return NextResponse.json({ error: 'Failed to read affiliates' }, { status: 500 })
  }
}

// POST - Register as affiliate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, displayName } = body
    
    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 })
    }
    
    const affiliates = readAffiliates()
    
    // Check if already an affiliate
    const existing = affiliates.find((a: any) => a.userId === userId)
    if (existing) {
      return NextResponse.json({ error: 'Already registered as affiliate' }, { status: 400 })
    }
    
    // Generate unique referral code
    const referralCode = `REF${userId.slice(0, 8).toUpperCase()}${Date.now().toString().slice(-6)}`
    
    const newAffiliate = {
      id: Date.now().toString(),
      userId,
      email,
      displayName: displayName || email.split('@')[0],
      referralCode,
      commissionRate: 10, // 10% commission
      totalReferrals: 0,
      totalEarnings: 0,
      paidEarnings: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    }
    
    affiliates.push(newAffiliate)
    writeAffiliates(affiliates)
    
    return NextResponse.json(newAffiliate)
  } catch (error) {
    console.error('Error creating affiliate:', error)
    return NextResponse.json({ error: 'Failed to register affiliate' }, { status: 500 })
  }
}

// PUT - Update affiliate (track referral, payout, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, referralCode, orderId, action } = body
    
    const affiliates = readAffiliates()
    const orders = readOrders()
    
    if (action === 'track_referral') {
      // Track a referral when order is placed
      const affiliate = affiliates.find((a: any) => a.referralCode === referralCode)
      if (affiliate) {
        const order = orders.find((o: any) => o.id === orderId)
        if (order && order.status === 'delivered') {
          affiliate.totalReferrals += 1
          affiliate.totalEarnings += order.total * (affiliate.commissionRate / 100)
          affiliate.updatedAt = new Date().toISOString()
          
          const index = affiliates.findIndex((a: any) => a.id === affiliate.id)
          affiliates[index] = affiliate
          writeAffiliates(affiliates)
        }
      }
    }
    
    if (action === 'payout') {
      const affiliate = affiliates.find((a: any) => a.userId === userId)
      if (affiliate) {
        affiliate.paidEarnings = affiliate.totalEarnings
        affiliate.updatedAt = new Date().toISOString()
        
        const index = affiliates.findIndex((a: any) => a.id === affiliate.id)
        affiliates[index] = affiliate
        writeAffiliates(affiliates)
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating affiliate:', error)
    return NextResponse.json({ error: 'Failed to update affiliate' }, { status: 500 })
  }
}

