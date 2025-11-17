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
      status: 'confirmed',
      paymentStatus: body.paymentStatus || (body.paymentMethod === 'cod' ? 'pending' : 'pending'),
      paymentMethod: body.paymentMethod || 'cod',
      paymentId: body.paymentId || null,
      trackingNumber: body.trackingNumber || null,
      trackingProvider: body.trackingProvider || null,
      trackingUrl: body.trackingUrl || null,
      estimatedDelivery: body.estimatedDelivery || null,
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
    const { 
      id, 
      status, 
      paymentStatus, 
      paymentId,
      trackingNumber,
      trackingProvider,
      trackingUrl,
      estimatedDelivery
    } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }
    
    const orders = await readOrders()
    const index = orders.findIndex((o: any) => o.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    const currentOrder = orders[index]
    const newStatus = status || currentOrder.status
    
    // Validate return order request
    if (newStatus === 'returned') {
      // Only delivered orders can be returned
      if (currentOrder.status !== 'delivered') {
        return NextResponse.json({ 
          error: 'Only delivered orders can be returned' 
        }, { status: 400 })
      }
      
      // Check if order was delivered within 3 days
      const deliveredDate = currentOrder.deliveredAt 
        ? new Date(currentOrder.deliveredAt)
        : currentOrder.updatedAt && currentOrder.status === 'delivered'
        ? new Date(currentOrder.updatedAt)
        : null
      
      if (deliveredDate) {
        const now = new Date()
        const daysSinceDelivery = (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysSinceDelivery > 3) {
          return NextResponse.json({ 
            error: 'Order can only be returned within 3 days of delivery' 
          }, { status: 400 })
        }
      }
    }
    
    // If status is being changed to 'delivered', record the deliveredAt timestamp
    const updateData: any = {
      ...currentOrder,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }
    
    // Update payment status if provided
    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus
      if (paymentStatus === 'paid' || paymentStatus === 'completed') {
        updateData.paidAt = new Date().toISOString()
      }
    }
    
    // Update payment ID if provided
    if (paymentId !== undefined) {
      updateData.paymentId = paymentId
    }
    
    // Update tracking information if provided
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber
    }
    if (trackingProvider !== undefined) {
      updateData.trackingProvider = trackingProvider
    }
    if (trackingUrl !== undefined) {
      updateData.trackingUrl = trackingUrl
    }
    if (estimatedDelivery !== undefined) {
      updateData.estimatedDelivery = estimatedDelivery
    }
    
    // Record when order was delivered
    if (newStatus === 'delivered' && currentOrder.status !== 'delivered') {
      updateData.deliveredAt = new Date().toISOString()
      
      // Create commission for artist if artwork has an artist
      try {
        const { readFile } = await import('fs/promises')
        const { existsSync } = await import('fs')
        const artworksFile = path.join(process.cwd(), 'data', 'artworks.json')
        
        if (existsSync(artworksFile)) {
          const artworksData = await readFile(artworksFile, 'utf-8')
          const artworks = JSON.parse(artworksData)
          const artwork = artworks.find((a: any) => a.id === currentOrder.artworkId)
          
          if (artwork && artwork.artistId && artwork.artistCommissionRate) {
            // Create commission record
            const commissionsFile = path.join(process.cwd(), 'data', 'commissions.json')
            let commissions = []
            
            if (existsSync(commissionsFile)) {
              const commissionsData = await readFile(commissionsFile, 'utf-8')
              commissions = JSON.parse(commissionsData)
            }
            
            // Check if commission already exists
            const existingCommission = commissions.find((c: any) => c.orderId === currentOrder.id)
            if (!existingCommission) {
              const commissionAmount = currentOrder.total * (artwork.artistCommissionRate / 100)
              
              const newCommission = {
                id: Date.now().toString(),
                orderId: currentOrder.id,
                artistId: artwork.artistId,
                orderAmount: currentOrder.total,
                commissionRate: artwork.artistCommissionRate,
                commissionAmount,
                platformFee: currentOrder.total - commissionAmount,
                status: 'pending',
                createdAt: new Date().toISOString(),
                paidAt: null,
                payoutId: null
              }
              
              commissions.push(newCommission)
              const { writeFile } = await import('fs/promises')
              await writeFile(commissionsFile, JSON.stringify(commissions, null, 2))
            }
          }
        }
      } catch (error) {
        console.error('Error creating commission:', error)
        // Don't fail the order update if commission creation fails
      }
    }
    
    // Record when order was returned
    if (newStatus === 'returned' && currentOrder.status !== 'returned') {
      updateData.returnedAt = new Date().toISOString()
      
      // Cancel any pending commissions for this order
      try {
        const { readFile, writeFile } = await import('fs/promises')
        const { existsSync } = await import('fs')
        const commissionsFile = path.join(process.cwd(), 'data', 'commissions.json')
        
        if (existsSync(commissionsFile)) {
          const commissionsData = await readFile(commissionsFile, 'utf-8')
          const commissions = JSON.parse(commissionsData)
          
          const commissionIndex = commissions.findIndex((c: any) => c.orderId === currentOrder.id && c.status === 'pending')
          if (commissionIndex !== -1) {
            commissions[commissionIndex].status = 'cancelled'
            commissions[commissionIndex].updatedAt = new Date().toISOString()
            await writeFile(commissionsFile, JSON.stringify(commissions, null, 2))
          }
        }
      } catch (error) {
        console.error('Error cancelling commission:', error)
      }
    }
    
    orders[index] = updateData
    
    await writeOrders(orders)
    
    return NextResponse.json(orders[index])
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE - Cancel order (only within 1 hour of placement) or Delete delivered order permanently
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true' // For permanent deletion
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }
    
    const orders = await readOrders()
    const orderIndex = orders.findIndex((o: any) => o.id === orderId)
    
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    const order = orders[orderIndex]
    
    // If permanent deletion is requested (for delivered or cancelled orders)
    if (permanent) {
      // Check if this is a hard delete (permanent=true&hard=true) or soft delete
      const hardDelete = searchParams.get('hard') === 'true'
      
      if (hardDelete) {
        // Hard delete - permanently remove from system (only from deleted orders section)
        if (order.status !== 'deleted' && order.status !== 'cancelled') {
          return NextResponse.json({ 
            error: 'Only deleted or cancelled orders can be permanently removed' 
          }, { status: 400 })
        }
        
        // Permanently delete the order
        orders.splice(orderIndex, 1)
        await writeOrders(orders)
        
        return NextResponse.json({ message: 'Order permanently deleted' })
      } else {
        // Soft delete - mark as deleted (for delivered orders)
        if (order.status !== 'delivered') {
          return NextResponse.json({ 
            error: 'Only delivered orders can be moved to deleted section' 
          }, { status: 400 })
        }
        
        // Mark order as deleted (soft delete)
        orders[orderIndex] = {
          ...order,
          status: 'deleted',
          updatedAt: new Date().toISOString()
        }
        
        await writeOrders(orders)
        
        return NextResponse.json(orders[orderIndex])
      }
    }
    
    // Otherwise, cancel the order (existing logic for user cancellation)
    // Check if order was placed within 1 hour
    const orderDate = new Date(order.createdAt)
    const now = new Date()
    const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceOrder > 1) {
      return NextResponse.json({ 
        error: 'Order can only be cancelled within 1 hour of placement' 
      }, { status: 400 })
    }
    
    // Check if order is already delivered or cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return NextResponse.json({ 
        error: `Cannot cancel order with status: ${order.status}` 
      }, { status: 400 })
    }
    
    // Update order status to cancelled
    orders[orderIndex] = {
      ...order,
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    }
    
    await writeOrders(orders)
    
    return NextResponse.json(orders[orderIndex])
  } catch (error) {
    console.error('Error processing delete request:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

