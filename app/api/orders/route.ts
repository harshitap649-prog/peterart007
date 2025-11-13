import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')

async function ensureDirectories() {
  if (!existsSync(path.join(process.cwd(), 'data'))) {
    await mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  }
}

async function readOrders() {
  await ensureDirectories()
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

async function writeOrders(orders: any[]) {
  await ensureDirectories()
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8')
}

// GET - Get all orders or user orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const orders = await readOrders()
    
    if (userId) {
      const userOrders = orders.filter((o: any) => o.userId === userId)
      return NextResponse.json(userOrders.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ))
    }
    
    return NextResponse.json(orders.sort((a: any, b: any) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ))
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const orders = await readOrders()
    const newId = Date.now().toString()
    
    const newOrder = {
      id: newId,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    orders.push(newOrder)
    await writeOrders(orders)
    
    return NextResponse.json(newOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }
    
    const orders = await readOrders()
    const index = orders.findIndex((o: any) => o.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    orders[index] = {
      ...orders[index],
      status: status || orders[index].status,
      updatedAt: new Date().toISOString()
    }
    
    await writeOrders(orders)
    
    return NextResponse.json(orders[index])
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

