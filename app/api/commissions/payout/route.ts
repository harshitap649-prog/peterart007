import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const COMMISSIONS_FILE = path.join(process.cwd(), 'data', 'commissions.json')
const PAYOUTS_FILE = path.join(process.cwd(), 'data', 'payouts.json')

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

async function readPayouts() {
  try {
    if (existsSync(PAYOUTS_FILE)) {
      const data = await readFile(PAYOUTS_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading payouts:', error)
    return []
  }
}

async function writePayouts(payouts: any[]) {
  try {
    await writeFile(PAYOUTS_FILE, JSON.stringify(payouts, null, 2))
  } catch (error) {
    console.error('Error writing payouts:', error)
    throw error
  }
}

// POST - Create payout request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artistId, commissionIds } = body
    
    if (!artistId || !commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const commissions = await readCommissions()
    const payouts = await readPayouts()
    
    // Get commissions to be paid
    const commissionsToPay = commissions.filter((c: any) => 
      commissionIds.includes(c.id) && 
      c.artistId === artistId && 
      c.status === 'pending'
    )
    
    if (commissionsToPay.length === 0) {
      return NextResponse.json({ error: 'No valid commissions found' }, { status: 400 })
    }
    
    const totalAmount = commissionsToPay.reduce((sum: number, c: any) => sum + c.commissionAmount, 0)
    
    // Create payout record
    const newPayout = {
      id: Date.now().toString(),
      artistId,
      commissionIds,
      totalAmount,
      status: 'pending', // pending, processing, completed, failed
      requestedAt: new Date().toISOString(),
      processedAt: null,
      completedAt: null,
      notes: ''
    }
    
    payouts.push(newPayout)
    await writePayouts(payouts)
    
    // Update commission statuses to 'processing'
    commissions.forEach((c: any) => {
      if (commissionIds.includes(c.id)) {
        c.status = 'processing'
        c.payoutId = newPayout.id
        c.updatedAt = new Date().toISOString()
      }
    })
    await writeCommissions(commissions)
    
    return NextResponse.json(newPayout)
  } catch (error) {
    console.error('Error creating payout:', error)
    return NextResponse.json({ error: 'Failed to create payout' }, { status: 500 })
  }
}

// GET - Get payouts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artistId')
    const status = searchParams.get('status')
    
    const payouts = await readPayouts()
    
    let filtered = payouts
    
    if (artistId) {
      filtered = filtered.filter((p: any) => p.artistId === artistId)
    }
    
    if (status) {
      filtered = filtered.filter((p: any) => p.status === status)
    }
    
    // Sort by date (newest first)
    filtered.sort((a: any, b: any) => 
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    )
    
    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
  }
}

// PUT - Update payout status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { payoutId, status, notes } = body
    
    if (!payoutId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const payouts = await readPayouts()
    const commissions = await readCommissions()
    
    const payoutIndex = payouts.findIndex((p: any) => p.id === payoutId)
    if (payoutIndex === -1) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }
    
    const payout = payouts[payoutIndex]
    
    // Update payout
    payouts[payoutIndex] = {
      ...payout,
      status,
      notes: notes || payout.notes,
      processedAt: status === 'processing' ? new Date().toISOString() : payout.processedAt,
      completedAt: status === 'completed' ? new Date().toISOString() : payout.completedAt,
      updatedAt: new Date().toISOString()
    }
    
    // If completed, update commissions to 'paid'
    if (status === 'completed') {
      commissions.forEach((c: any) => {
        if (payout.commissionIds.includes(c.id)) {
          c.status = 'paid'
          c.paidAt = new Date().toISOString()
          c.updatedAt = new Date().toISOString()
        }
      })
    } else if (status === 'failed') {
      // If failed, revert commissions back to 'pending'
      commissions.forEach((c: any) => {
        if (payout.commissionIds.includes(c.id)) {
          c.status = 'pending'
          c.payoutId = null
          c.updatedAt = new Date().toISOString()
        }
      })
    }
    
    await writePayouts(payouts)
    await writeCommissions(commissions)
    
    return NextResponse.json(payouts[payoutIndex])
  } catch (error) {
    console.error('Error updating payout:', error)
    return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 })
  }
}

