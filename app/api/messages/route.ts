import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const messagesFilePath = path.join(process.cwd(), 'data', 'messages.json')

function readMessages() {
  try {
    const data = fs.readFileSync(messagesFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeMessages(messages: any[]) {
  fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2))
}

// GET - Get messages (conversations)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const conversationId = searchParams.get('conversationId')
    const orderId = searchParams.get('orderId')
    const type = searchParams.get('type') || 'all' // all, direct, order
    
    const messages = readMessages()
    
    if (conversationId) {
      const conversation = messages.filter((m: any) => m.conversationId === conversationId)
      return NextResponse.json(conversation.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ))
    }
    
    if (userId) {
      let userMessages = messages.filter((m: any) => 
        m.senderId === userId || m.receiverId === userId
      )
      
      if (type === 'order' && orderId) {
        userMessages = userMessages.filter((m: any) => m.orderId === orderId)
      }
      
      // Group by conversation
      const conversations: { [key: string]: any[] } = {}
      userMessages.forEach((msg: any) => {
        const convId = msg.conversationId
        if (!conversations[convId]) {
          conversations[convId] = []
        }
        conversations[convId].push(msg)
      })
      
      return NextResponse.json(Object.values(conversations))
    }
    
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  } catch (error) {
    console.error('Error reading messages:', error)
    return NextResponse.json({ error: 'Failed to read messages' }, { status: 500 })
  }
}

// POST - Send message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      senderId,
      receiverId,
      conversationId,
      orderId,
      message,
      type = 'direct' // direct, order
    } = body
    
    if (!senderId || !receiverId || !message) {
      return NextResponse.json({ error: 'Sender, receiver, and message are required' }, { status: 400 })
    }
    
    const messages = readMessages()
    const convId = conversationId || `${senderId}_${receiverId}_${orderId || 'direct'}`
    
    const newMessage = {
      id: Date.now().toString(),
      conversationId: convId,
      senderId,
      receiverId,
      orderId: orderId || null,
      type,
      message,
      read: false,
      createdAt: new Date().toISOString()
    }
    
    messages.push(newMessage)
    writeMessages(messages)
    
    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// PUT - Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, userId } = body
    
    if (!conversationId || !userId) {
      return NextResponse.json({ error: 'Conversation ID and User ID are required' }, { status: 400 })
    }
    
    const messages = readMessages()
    const updatedMessages = messages.map((msg: any) => {
      if (msg.conversationId === conversationId && msg.receiverId === userId && !msg.read) {
        return { ...msg, read: true }
      }
      return msg
    })
    
    writeMessages(updatedMessages)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating messages:', error)
    return NextResponse.json({ error: 'Failed to update messages' }, { status: 500 })
  }
}

