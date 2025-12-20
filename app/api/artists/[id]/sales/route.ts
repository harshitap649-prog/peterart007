import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')
const ARTWORKS_FILE = path.join(process.cwd(), 'data', 'artworks.json')

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

// GET - Get artist sales statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orders = await readOrders()
    const artworks = await readArtworks()
    
    // Get all artworks by this artist
    const artistArtworkIds = artworks
      .filter((a: any) => a.artistId === params.id)
      .map((a: any) => a.id)
    
    // Get all orders for artist's artworks (including all statuses for admin view)
    const allArtistOrders = orders.filter((o: any) => 
      artistArtworkIds.includes(o.artworkId) && 
      o.status !== 'cancelled' && 
      o.status !== 'returned'
    )
    
    // Only count DELIVERED orders for earnings and revenue (for artist dashboard)
    const deliveredOrders = allArtistOrders.filter((o: any) => o.status === 'delivered')
    
    // Calculate statistics - ONLY for delivered orders
    const totalSales = deliveredOrders.length
    const totalRevenue = deliveredOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
    const totalQuantity = deliveredOrders.reduce((sum: number, order: any) => sum + (order.quantity || 1), 0)
    
    // Get artist commission rate
    const artistArtwork = artworks.find((a: any) => a.artistId === params.id)
    const commissionRate = artistArtwork?.artistCommissionRate || 70 // Default 70%
    
    const totalEarnings = totalRevenue * (commissionRate / 100)
    const platformFee = totalRevenue - totalEarnings
    
    // Group by status (for all orders)
    const byStatus = {
      pending: allArtistOrders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length,
      delivered: deliveredOrders.length
    }
    
    // Recent sales (last 30 days) - only delivered
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentSales = deliveredOrders.filter((o: any) => 
      new Date(o.createdAt) >= thirtyDaysAgo
    ).length
    
    return NextResponse.json({
      totalSales,
      totalRevenue,
      totalQuantity,
      totalEarnings,
      platformFee,
      commissionRate,
      byStatus,
      recentSales,
      orders: deliveredOrders.slice(0, 10) // Last 10 DELIVERED orders only
    })
  } catch (error) {
    console.error('Error fetching artist sales:', error)
    return NextResponse.json({ error: 'Failed to fetch artist sales' }, { status: 500 })
  }
}

