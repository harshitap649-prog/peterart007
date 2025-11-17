import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const subscribersFilePath = path.join(process.cwd(), 'data', 'newsletter-subscribers.json')

function readSubscribers() {
  try {
    const data = fs.readFileSync(subscribersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeSubscribers(subscribers: any[]) {
  fs.writeFileSync(subscribersFilePath, JSON.stringify(subscribers, null, 2))
}

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    const subscribers = readSubscribers()
    
    // Check if already subscribed
    const existing = subscribers.find((s: any) => s.email === email)
    if (existing) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })
    }
    
    const newSubscriber = {
      id: Date.now().toString(),
      email,
      subscribedAt: new Date().toISOString(),
      active: true
    }
    
    subscribers.push(newSubscriber)
    writeSubscribers(subscribers)
    
    return NextResponse.json({ success: true, message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}

// GET - Get all subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    const subscribers = readSubscribers()
    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Error reading subscribers:', error)
    return NextResponse.json({ error: 'Failed to read subscribers' }, { status: 500 })
  }
}

