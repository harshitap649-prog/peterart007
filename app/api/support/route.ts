import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const SUPPORT_FILE = path.join(process.cwd(), 'data', 'support-messages.json')

async function ensureDirectories() {
  if (!existsSync(path.join(process.cwd(), 'data'))) {
    await mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  }
}

async function readMessages() {
  await ensureDirectories()
  try {
    if (existsSync(SUPPORT_FILE)) {
      const data = await readFile(SUPPORT_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading support messages:', error)
    return []
  }
}

async function writeMessages(messages: any[]) {
  await ensureDirectories()
  await writeFile(SUPPORT_FILE, JSON.stringify(messages, null, 2), 'utf-8')
}

// GET - Get all support messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const messages = await readMessages()
    // Sort by createdAt descending (newest first)
    return NextResponse.json(
      messages.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
    )
  } catch (error) {
    console.error('Error fetching support messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Create new support message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, userName, subject, message, orderId, type, images } = body
    
    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }
    
    const messages = await readMessages()
    const newMessage = {
      id: Date.now().toString(),
      userId: userId || '',
      userEmail: userEmail || '',
      userName: userName || 'Anonymous',
      subject,
      message,
      type: type || 'general', // 'general', 'order', 'website', 'other'
      orderId: orderId || null,
      images: images || [], // Array of base64 encoded images
      status: 'pending', // 'pending', 'in-progress', 'resolved', 'closed'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminResponse: null,
      resolvedAt: null
    }
    
    messages.push(newMessage)
    await writeMessages(messages)
    
    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Error creating support message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}

// PUT - Update support message status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, adminResponse } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }
    
    const messages = await readMessages()
    const index = messages.findIndex((m: any) => m.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    
    const updateData: any = {
      status: status || messages[index].status,
      updatedAt: new Date().toISOString()
    }
    
    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse
    }
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date().toISOString()
    }
    
    messages[index] = {
      ...messages[index],
      ...updateData
    }
    
    await writeMessages(messages)
    
    return NextResponse.json(messages[index])
  } catch (error) {
    console.error('Error updating support message:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

// DELETE - Delete support message (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }
    
    const messages = await readMessages()
    const filteredMessages = messages.filter((m: any) => m.id !== id)
    
    if (filteredMessages.length === messages.length) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    
    await writeMessages(filteredMessages)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting support message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}

