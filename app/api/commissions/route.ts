import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const COMMISSIONS_FILE = path.join(process.cwd(), 'data', 'commissions.json')
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')
const ARTWORKS_FILE = path.join(process.cwd(), 'data', 'artworks.json')
const ARTISTS_FILE = path.join(process.cwd(), 'data', 'artists.json')

async function readCommissions() {
  try {
    if (existsSync(COMMISSIONS_FILE)) {
      const data = await readFile(COMMISSIONS_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading commissions:', error)
    return []
  }
}

async function writeCommissions(commissions: any[]) {
  try {
    await writeFile(COMMISSIONS_FILE, JSON.stringify(commissions, null, 2))
  } catch (error) {
    console.error('Error writing commissions:', error)
    throw error
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

async function readArtists() {
  try {
    if (existsSync(ARTISTS_FILE)) {
      const data = await readFile(ARTISTS_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading artists:', error)
    return []
  }
}

// GET - Get commissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artistId')
    const status = searchParams.get('status')
    
    const commissions = await readCommissions()
    
    let filtered = commissions
    
    if (artistId) {
      filtered = filtered.filter((c: any) => c.artistId === artistId)
    }
    
    if (status) {
      filtered = filtered.filter((c: any) => c.status === status)
    }
    
    // Sort by date (newest first)
    filtered.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 })
  }
}

// POST - Create commission (called when order is delivered)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, artistId, orderAmount, commissionRate } = body
    
    if (!orderId || !artistId || !orderAmount || !commissionRate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const commissions = await readCommissions()
    
    // Check if commission already exists for this order
    const existing = commissions.find((c: any) => c.orderId === orderId)
    if (existing) {
      return NextResponse.json(existing)
    }
    
    const commissionAmount = orderAmount * (commissionRate / 100)
    const platformFee = orderAmount - commissionAmount
    
    const newCommission = {
      id: Date.now().toString(),
      orderId,
      artistId,
      orderAmount,
      commissionRate,
      commissionAmount,
      platformFee,
      status: 'pending', // pending, paid, cancelled
      createdAt: new Date().toISOString(),
      paidAt: null,
      payoutId: null
    }
    
    commissions.push(newCommission)
    await writeCommissions(commissions)
    
    return NextResponse.json(newCommission)
  } catch (error) {
    console.error('Error creating commission:', error)
    return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 })
  }
}

// PUT - Update commission status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { commissionId, status, payoutId } = body
    
    if (!commissionId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const commissions = await readCommissions()
    const index = commissions.findIndex((c: any) => c.id === commissionId)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }
    
    commissions[index] = {
      ...commissions[index],
      status,
      paidAt: status === 'paid' ? new Date().toISOString() : commissions[index].paidAt,
      payoutId: payoutId || commissions[index].payoutId,
      updatedAt: new Date().toISOString()
    }
    
    await writeCommissions(commissions)
    
    return NextResponse.json(commissions[index])
  } catch (error) {
    console.error('Error updating commission:', error)
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
  }
}

