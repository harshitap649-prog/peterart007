'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getAllArtworks, addArtwork, updateArtwork, deleteArtwork } from '@/lib/artworks'
import { getAllOrders, updateOrderStatus, getOrdersByStatus, deleteOrder } from '@/lib/orders'
import { getAllUsers, disableUser, deleteUser } from '@/lib/users'
import { getAllSupportMessages, updateSupportMessage, deleteSupportMessage } from '@/lib/support'
import { getAllArtists, updateArtistProfile, getArtistArtworks, deleteArtist } from '@/lib/artists'
import { logout } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiHome, FiShoppingBag, FiUsers, FiUser, FiPackage, FiMessageSquare, FiCheck, FiX, FiSearch, FiImage, FiEye, FiMail, FiMenu, FiLogOut } from 'react-icons/fi'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [ordersSubTab, setOrdersSubTab] = useState<'pending' | 'delivered'>('pending')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [artworks, setArtworks] = useState<any[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [supportMessages, setSupportMessages] = useState<any[]>([])
  const [artists, setArtists] = useState<any[]>([])
  const [artistStatusFilter, setArtistStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(true)
  const [artistsMap, setArtistsMap] = useState<Map<string, any>>(new Map())
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [showArtworkForm, setShowArtworkForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null)
  const [editingArtwork, setEditingArtwork] = useState<any>(null)
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [showOrderDeleteConfirm, setShowOrderDeleteConfirm] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [trackingData, setTrackingData] = useState<{ [key: string]: { trackingNumber: string; trackingProvider: string; trackingUrl: string } }>({})
  const [showArtistArtworks, setShowArtistArtworks] = useState(false)
  const [selectedArtistForArtworks, setSelectedArtistForArtworks] = useState<any>(null)
  const [artistArtworks, setArtistArtworks] = useState<any[]>([])
  const [loadingArtworks, setLoadingArtworks] = useState(false)
  const [showArtistDeleteConfirm, setShowArtistDeleteConfirm] = useState(false)
  const [artistToDelete, setArtistToDelete] = useState<any>(null)
  const [deletingArtist, setDeletingArtist] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    artistId: '',
    images: [] as File[]
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  useEffect(() => {
    loadData()
  }, [activeTab])

  useEffect(() => {
    if (searchTerm) {
      const filtered = artworks.filter((artwork: any) =>
        artwork.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredArtworks(filtered)
    } else {
      setFilteredArtworks(artworks)
    }
  }, [searchTerm, artworks])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'artworks' || activeTab === 'home') {
        const arts = await getAllArtworks(true) // Include pending artists for admin
        setArtworks(arts)
        setFilteredArtworks(arts)
      }
      if (activeTab === 'orders' || activeTab === 'home') {
        const ords = await getAllOrders()
        setOrders(ords)
      }
      if (activeTab === 'users') {
        const usrs = await getAllUsers()
        setUsers(usrs.filter(u => !u.isAdmin))
      }
      if (activeTab === 'deletedOrders' || activeTab === 'home') {
        const ords = await getAllOrders()
        setOrders(ords)
      }
      if (activeTab === 'support' || activeTab === 'home') {
        const messages = await getAllSupportMessages()
        setSupportMessages(messages)
      }
      if (activeTab === 'artists' || activeTab === 'artworks' || activeTab === 'home') {
        const artistList = await getAllArtists()
        setArtists(artistList)
        // Create a map for quick artist lookup
        const map = new Map()
        artistList.forEach((artist: any) => {
          map.set(artist.id, artist)
        })
        setArtistsMap(map)
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 6)
      setFormData({ ...formData, images: files })
      
      // Create previews
      const previews: string[] = []
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          previews.push(reader.result as string)
          if (previews.length === files.length) {
            setImagePreviews(previews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price')
      return
    }
    // Only require images for new artworks, not when editing
    if (!editingArtwork && formData.images.length === 0) {
      toast.error('Please select at least one image')
      return
    }
    
    // When editing, if no new images are selected, existing images will be preserved
    
    try {
      if (editingArtwork) {
        await updateArtwork(editingArtwork.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category.trim(),
          artistId: formData.artistId || null
        }, formData.images)
        toast.success('Artwork updated successfully')
      } else {
        await addArtwork({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category.trim(),
          artistId: formData.artistId || null
        }, formData.images)
        toast.success('Artwork added successfully')
      }
      
      // Reset form and close modal
      setShowArtworkForm(false)
      setEditingArtwork(null)
      setFormData({ title: '', description: '', price: '', category: '', artistId: '', images: [] })
      setImagePreviews([])
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Reload data to show updated list
      await loadData()
      
      // Ensure artworks tab is active to see the new artwork
      if (activeTab !== 'artworks' && activeTab !== 'home') {
        setActiveTab('artworks')
      }
    } catch (error: any) {
      console.error('Error saving artwork:', error)
      toast.error(error.message || 'Failed to save artwork. Please try again.')
    }
  }

  const handleEdit = (artwork: any) => {
    setEditingArtwork(artwork)
    setFormData({
      title: artwork.title,
      description: artwork.description,
      price: artwork.price.toString(),
      category: artwork.category || '',
      artistId: artwork.artistId || '',
      images: []
    })
    // Set existing images as previews
    setImagePreviews(artwork.images || [])
    setShowArtworkForm(true)
  }

  const handleDelete = (id: string) => {
    setArtworkToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!artworkToDelete) return
    
    try {
      await deleteArtwork(artworkToDelete)
      toast.success('Artwork deleted successfully')
      setShowDeleteConfirm(false)
      setArtworkToDelete(null)
      
      // Force reload data and clear filtered artworks
      setSearchTerm('')
      await loadData()
      
      // Also update the artworks state directly to ensure UI updates
      setArtworks(prev => prev.filter(a => a.id !== artworkToDelete))
      setFilteredArtworks(prev => prev.filter(a => a.id !== artworkToDelete))
    } catch (error: any) {
      console.error('Error deleting artwork:', error)
      toast.error(error.message || 'Failed to delete artwork. Please try again.')
    }
  }

  const handleDisableUser = async (userId: string, disabled: boolean) => {
    try {
      await disableUser(userId, disabled)
      toast.success(`User ${disabled ? 'disabled' : 'enabled'} successfully`)
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setShowUserDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      await deleteUser(userToDelete)
      toast.success('User deleted successfully')
      setShowUserDeleteConfirm(false)
      setUserToDelete(null)
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const handleArtistStatusChange = async (artistId: string, status: 'approved' | 'rejected') => {
    try {
      await updateArtistProfile(artistId, {
        status,
        verificationStatus: status === 'approved' ? 'verified' : 'rejected'
      })
      toast.success(`Artist ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update artist')
    }
  }

  const handleViewArtistArtworks = async (artist: any) => {
    setSelectedArtistForArtworks(artist)
    setLoadingArtworks(true)
    setShowArtistArtworks(true)
    try {
      const artworks = await getArtistArtworks(artist.id)
      setArtistArtworks(artworks)
    } catch (error: any) {
      console.error('Error loading artist artworks:', error)
      toast.error('Failed to load artist artworks')
      setArtistArtworks([])
    } finally {
      setLoadingArtworks(false)
    }
  }

  const handleDeleteArtist = (artist: any) => {
    setArtistToDelete(artist)
    setShowArtistDeleteConfirm(true)
  }

  const confirmDeleteArtist = async () => {
    if (!artistToDelete) return
    
    setDeletingArtist(true)
    try {
      const result = await deleteArtist(artistToDelete.id)
      toast.success(`Artist removed successfully. ${result.deletedArtworksCount || 0} artwork(s) also removed.`)
      setShowArtistDeleteConfirm(false)
      setArtistToDelete(null)
      await loadData()
    } catch (error: any) {
      console.error('Error deleting artist:', error)
      toast.error(error.message || 'Failed to delete artist')
    } finally {
      setDeletingArtist(false)
    }
  }

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId)
    setShowOrderDeleteConfirm(true)
  }

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return
    
    // Check if we're deleting from delivered section (soft delete) or deleted section (hard delete)
    const order = orders.find(o => o.id === orderToDelete)
    const isHardDelete = order?.status === 'deleted' || order?.status === 'cancelled'
    
    try {
      await deleteOrder(orderToDelete, isHardDelete)
      toast.success(isHardDelete ? 'Order permanently deleted' : 'Order moved to deleted section')
      setShowOrderDeleteConfirm(false)
      setOrderToDelete(null)
      
      if (isHardDelete) {
        // Remove from local state immediately for hard delete
        setOrders(prevOrders => prevOrders.filter(o => o.id !== orderToDelete))
      } else {
        // Update status in local state for soft delete
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === orderToDelete ? { ...o, status: 'deleted' } : o
          )
        )
      }
      
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete order')
    }
  }
  

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Optimistically update the order status in local state for instant UI feedback
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      
      // Update the status in the backend
      await updateOrderStatus(orderId, newStatus)
      toast.success('Order status updated')
      
      // Reload data to ensure consistency
      await loadData()
    } catch (error) {
      // Revert the optimistic update on error
      await loadData()
      toast.error('Failed to update order status')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Logout failed')
    }
  }

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const leftOrders = orders.filter(o => o.status === 'left')
  const deletedOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'deleted')
  const filteredArtists = artists.filter((artist: any) =>
    artistStatusFilter === 'all' ? true : artist.status === artistStatusFilter
  )
  const pendingArtists = artists.filter((artist: any) => artist.status === 'pending')
  const approvedArtists = artists.filter((artist: any) => artist.status === 'approved')
  const rejectedArtists = artists.filter((artist: any) => artist.status === 'rejected')

  const navTabs = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'artworks', label: 'All Artworks', icon: FiShoppingBag },
    { id: 'orders', label: 'All Orders', icon: FiPackage },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'artists', label: 'Artists', icon: FiUser },
    { id: 'deletedOrders', label: 'Deleted Orders', icon: FiTrash2, badge: deletedOrders.length },
    { id: 'support', label: 'Support Messages', icon: FiMessageSquare, badge: supportMessages.filter((m: any) => m.status === 'pending').length },
  ]

  return (
    <div className="pb-28 md:pb-0 min-h-screen">
      {/* Top Bar with Menu Icon */}
      <div className="flex items-center justify-between mb-2 md:mb-6 px-3 md:px-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all active:scale-95"
          aria-label="Open menu"
        >
          <FiMenu className="text-lg md:text-xl text-gray-700" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12"></div> {/* Spacer for centering */}
      </div>

      {/* Logo and Heading at Top */}
      <div className="text-center mb-3 md:mb-8">
        <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-3 md:mb-4 overflow-hidden" style={{ borderRadius: '0 0 50% 50%' }}>
          <img
            src="https://png.pngtree.com/png-vector/20240618/ourmid/pngtree-a-cute-girl-dancing-colorful-art-design-png-image_12793513.png"
            alt="Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      </div>

      {/* Sidebar Menu */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[200] transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            style={{ backdropFilter: 'blur(3px)' }}
          ></div>
          
          <div className="fixed inset-0 z-[201] flex items-start justify-start md:justify-center p-0 md:p-8 pointer-events-none">
            <div className="w-[75vw] max-w-[280px] md:w-[280px] bg-white h-full md:h-auto md:rounded-xl md:max-h-[90vh] shadow-2xl overflow-hidden pointer-events-auto animate-slideInLeft border-r border-gray-100 md:border-r-0 md:border md:border-gray-200">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-gray-900">Admin Menu</h2>
        <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-all duration-200 flex-shrink-0 active:scale-95"
                    aria-label="Close menu"
                  >
                    <FiX className="text-lg" />
        </button>
                </div>
              </div>
              
              {/* Navigation Menu */}
              <nav className="py-3 max-h-[calc(100vh-250px)] overflow-y-auto overscroll-contain">
                {navTabs.map((tab) => {
                  const isActiveTab = activeTab === tab.id
                  const Icon = tab.icon
                  
                  return (
        <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-300 mx-2 rounded-lg mb-1.5 relative overflow-hidden active:scale-[0.98] ${
                        isActiveTab
                          ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/40'
                          : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 relative z-10 transition-all ${
                        isActiveTab 
                          ? 'bg-white/25 backdrop-blur-sm shadow-inner' 
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50'
                      }`}>
                        <Icon 
                          className={`text-base relative z-10 ${
                            isActiveTab ? 'text-white drop-shadow-lg' : 'text-gray-700'
                          }`}
                        />
                      </div>
                      <span className="flex-1 text-left relative z-10">{tab.label}</span>
                      {tab.badge && tab.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          isActiveTab ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {tab.badge}
            </span>
          )}
        </button>
                  )
                }                )}
              </nav>

              {/* Logout Button */}
              <div className="border-t border-gray-200 mt-2 pt-2 px-2">
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true)
                    setSidebarOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-300 rounded-lg mb-1.5 relative overflow-hidden active:scale-[0.98] text-red-600 hover:bg-red-50 active:bg-red-100"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 relative z-10 transition-all bg-red-100 border border-red-200/50">
                    <FiLogOut 
                      className="text-base relative z-10 text-red-600"
                    />
                  </div>
                  <span className="flex-1 text-left relative z-10">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}


      {/* Home Tab */}
      {activeTab === 'home' && (
        <div className="px-2 md:px-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 mb-2 md:mb-6">
            <div className="card p-2 md:p-4">
              <h3 className="text-gray-400 mb-1.5 text-xs md:text-sm">Total Artworks</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{artworks.length}</p>
            </div>
            <div className="card p-3 md:p-4">
              <h3 className="text-gray-400 mb-1.5 text-xs md:text-sm">Pending Orders</h3>
              <p className="text-2xl md:text-3xl font-bold text-yellow-400">{pendingOrders.length}</p>
            </div>
            <div className="card p-3 md:p-4">
              <h3 className="text-gray-400 mb-1.5 text-xs md:text-sm">Delivered</h3>
              <p className="text-2xl md:text-3xl font-bold text-green-400">{deliveredOrders.length}</p>
            </div>
            <div className="card p-3 md:p-4">
              <h3 className="text-gray-400 mb-1.5 text-xs md:text-sm">Left Orders</h3>
              <p className="text-2xl md:text-3xl font-bold text-red-400">{leftOrders.length}</p>
            </div>
            <div className="card p-3 md:p-4">
              <h3 className="text-gray-400 mb-1.5 text-xs md:text-sm">Deleted Orders</h3>
              <p className="text-2xl md:text-3xl font-bold text-red-400">{deletedOrders.length}</p>
            </div>
            <div className="card p-3 md:p-4">
              <h3 className="text-gray-400 mb-1.5 text-xs md:text-sm">Support Messages</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {supportMessages.filter((m: any) => m.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Pending</p>
            </div>
          </div>
        </div>
      )}

      {/* Artworks Tab */}
      {activeTab === 'artworks' && (
        <div className="px-2 md:px-0">
          <div className="flex justify-between items-center mb-2 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold">All Artworks</h2>
            <button
              onClick={() => {
                setEditingArtwork(null)
                setFormData({ title: '', description: '', price: '', category: '', artistId: '', images: [] })
                setImagePreviews([])
                setShowArtworkForm(true)
              }}
              className="btn-primary flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-1.5 md:py-2 px-3 md:px-4"
            >
              <FiPlus className="text-xs md:text-sm" />
              <span className="hidden sm:inline">Add New Artwork</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search artworks..."
                className="input-field pr-9 text-sm py-2"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900 text-sm" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading artworks...</p>
            </div>
          ) : filteredArtworks.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <FiSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-sm md:text-base">
                No results found for "<span className="font-semibold">{searchTerm}</span>"
              </p>
            </div>
          ) : filteredArtworks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No artworks available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 md:gap-3 lg:gap-4">
              {filteredArtworks.map((artwork: any) => (
                <div key={artwork.id} className="card p-1.5 md:p-3 lg:p-4">
                  {artwork.images && artwork.images[0] ? (
                    <img
                      src={artwork.images[0]}
                      alt={artwork.title}
                      className="w-full h-28 sm:h-36 md:h-48 object-cover rounded-lg mb-2 md:mb-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="w-full h-28 sm:h-36 md:h-48 bg-gray-200 rounded-lg mb-2 md:mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                  <h3 className="font-bold text-xs md:text-base lg:text-lg mb-1 md:mb-1.5 line-clamp-1">{artwork.title}</h3>
                  <p className="text-gray-400 text-xs mb-1 md:mb-2 line-clamp-2 hidden sm:block">{artwork.description}</p>
                  <p className="text-orange-600 font-bold text-sm md:text-base lg:text-lg mb-2 md:mb-3">₹{artwork.price}</p>
                  <div className="flex gap-1 md:gap-1.5 lg:gap-2">
                    <button
                      onClick={() => handleEdit(artwork)}
                      className="btn-secondary flex-1 flex items-center justify-center gap-0.5 md:gap-1 lg:gap-2 text-xs md:text-sm py-1 md:py-1.5"
                    >
                      <FiEdit className="text-xs" />
                      <span className="text-xs md:text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(artwork.id)}
                      className="btn-secondary flex-1 flex items-center justify-center gap-0.5 md:gap-1 lg:gap-2 text-red-400 text-xs md:text-sm py-1 md:py-1.5"
                    >
                      <FiTrash2 className="text-xs" />
                      <span className="text-xs md:text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="px-2 md:px-0">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">All Orders</h2>
          
          {/* Sub-tabs for Pending and Delivered */}
          <div className="flex gap-2 mb-4 md:mb-6 border-b border-gray-300">
            <button
              onClick={() => setOrdersSubTab('pending')}
              className={`px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium transition-all border-b-2 ${
                ordersSubTab === 'pending'
                  ? 'border-yellow-400 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Pending Orders ({pendingOrders.length})
            </button>
            <button
              onClick={() => setOrdersSubTab('delivered')}
              className={`px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium transition-all border-b-2 ${
                ordersSubTab === 'delivered'
                  ? 'border-green-400 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Delivered Orders ({deliveredOrders.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading orders...</p>
            </div>
          ) : (
            <div>
              {/* Pending Orders Section */}
              {ordersSubTab === 'pending' && (
                <div>
                  {pendingOrders.length > 0 ? (
                    <div className="space-y-2 md:space-y-3">
                      {pendingOrders.map((order: any) => {
                        const isExpanded = expandedOrders.has(order.id)
                        return (
                        <div key={order.id} className="card p-2 md:p-3">
                          <div className="flex items-start justify-between gap-2 md:gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm md:text-base truncate">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-gray-400 text-xs truncate">{order.userEmail}</p>
                              <p className="text-gray-400 text-xs">User: {order.userName || 'N/A'}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 whitespace-nowrap">
                                {order.status === 'confirmed' ? 'Order Confirmed' : 'Pending'}
                              </span>
                              <select
                                value={order.status === 'confirmed' ? 'pending' : order.status}
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                className="input-field text-xs py-1 px-2 w-auto min-w-[100px]"
                              >
                                <option value="pending">Pending</option>
                                <option value="delivered">Delivered</option>
                                <option value="left">Left</option>
                              </select>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-gray-300 space-y-3">
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Artwork</p>
                                  <p className="font-medium text-xs md:text-sm">{order.artworkTitle}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Quantity</p>
                                  <p className="font-medium text-xs md:text-sm">{order.quantity || 1}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Unit Price</p>
                                  <p className="font-medium text-xs md:text-sm">₹{order.unitPrice || order.total}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Total Price</p>
                                  <p className="text-orange-600 font-bold text-sm md:text-base">₹{order.total}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Payment</p>
                                  <p className="font-medium text-xs md:text-sm">
                                    {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                  </p>
                                </div>
                              </div>

                              {order.paymentMethod === 'cod' && (
                                <div className="p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-400/20">
                                  <p className="text-gray-400 text-xs mb-1">Delivery Address</p>
                                  <p className="text-gray-900 text-xs md:text-sm">
                                    {order.fullName || 'N/A'}<br />
                                    {order.address1 || ''}<br />
                                    {order.address2 && `${order.address2}, `}
                                    {order.city || ''}, {order.state || ''} - {order.pincode || ''}<br />
                                    {order.phone || ''}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => toggleOrderDetails(order.id)}
                            className="mt-2 w-full btn-secondary text-xs py-1.5 px-3"
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-sm md:text-base">No pending orders found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Delivered Orders Section */}
              {ordersSubTab === 'delivered' && (
                <div>
                  {deliveredOrders.length > 0 ? (
                    <div className="space-y-2 md:space-y-3">
                      {deliveredOrders.map((order: any) => {
                        const isExpanded = expandedOrders.has(order.id)
                        return (
                        <div key={order.id} className="card p-2 md:p-3">
                          <div className="flex items-start justify-between gap-2 md:gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm md:text-base truncate">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-gray-400 text-xs truncate">{order.userEmail}</p>
                              <p className="text-gray-400 text-xs">User: {order.userName || 'N/A'}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 whitespace-nowrap">
                                Delivered
                              </span>
                              <select
                                value={order.status === 'confirmed' ? 'pending' : order.status}
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                className="input-field text-xs py-1 px-2 w-auto min-w-[100px]"
                              >
                                <option value="pending">Pending</option>
                                <option value="delivered">Delivered</option>
                                <option value="left">Left</option>
                              </select>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-gray-300 space-y-3">
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Artwork</p>
                                  <p className="font-medium text-xs md:text-sm">{order.artworkTitle}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Quantity</p>
                                  <p className="font-medium text-xs md:text-sm">{order.quantity || 1}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Unit Price</p>
                                  <p className="font-medium text-xs md:text-sm">₹{order.unitPrice || order.total}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Total Price</p>
                                  <p className="text-orange-600 font-bold text-sm md:text-base">₹{order.total}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Payment</p>
                                  <p className="font-medium text-xs md:text-sm">
                                    {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                  </p>
                                </div>
                              </div>

                              {order.paymentMethod === 'cod' && (
                                <div className="p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-400/20">
                                  <p className="text-gray-400 text-xs mb-1">Delivery Address</p>
                                  <p className="text-gray-900 text-xs md:text-sm">
                                    {order.fullName || 'N/A'}<br />
                                    {order.address1 || ''}<br />
                                    {order.address2 && `${order.address2}, `}
                                    {order.city || ''}, {order.state || ''} - {order.pincode || ''}<br />
                                    {order.phone || ''}
                                  </p>
                                </div>
                              )}

                              {/* Tracking Information */}
                              <div className="p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200 mt-2">
                                <p className="text-gray-400 text-xs mb-2 font-semibold">Tracking Information</p>
                                {order.trackingNumber ? (
                                  <div className="space-y-1">
                                    <p className="text-gray-900 text-xs md:text-sm font-medium">
                                      Tracking: {order.trackingNumber}
                                    </p>
                                    {order.trackingProvider && (
                                      <p className="text-gray-600 text-xs">
                                        Provider: {order.trackingProvider}
                                      </p>
                                    )}
                                    {order.trackingUrl && (
                                      <a
                                        href={order.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 text-xs underline"
                                      >
                                        Track Package
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Tracking Number"
                                      value={trackingData[order.id]?.trackingNumber || ''}
                                      onChange={(e) => setTrackingData({
                                        ...trackingData,
                                        [order.id]: {
                                          ...trackingData[order.id],
                                          trackingNumber: e.target.value,
                                          trackingProvider: trackingData[order.id]?.trackingProvider || 'Shiprocket',
                                          trackingUrl: trackingData[order.id]?.trackingUrl || ''
                                        }
                                      })}
                                      className="input-field text-xs py-1.5 w-full"
                                    />
                                    <select
                                      value={trackingData[order.id]?.trackingProvider || 'Shiprocket'}
                                      onChange={(e) => setTrackingData({
                                        ...trackingData,
                                        [order.id]: {
                                          ...trackingData[order.id],
                                          trackingProvider: e.target.value,
                                          trackingNumber: trackingData[order.id]?.trackingNumber || '',
                                          trackingUrl: trackingData[order.id]?.trackingUrl || ''
                                        }
                                      })}
                                      className="input-field text-xs py-1.5 w-full"
                                    >
                                      <option value="Shiprocket">Shiprocket</option>
                                      <option value="Delhivery">Delhivery</option>
                                      <option value="BlueDart">BlueDart</option>
                                      <option value="DTDC">DTDC</option>
                                      <option value="Other">Other</option>
                                    </select>
                                    <input
                                      type="url"
                                      placeholder="Tracking URL (optional)"
                                      value={trackingData[order.id]?.trackingUrl || ''}
                                      onChange={(e) => setTrackingData({
                                        ...trackingData,
                                        [order.id]: {
                                          ...trackingData[order.id],
                                          trackingUrl: e.target.value,
                                          trackingNumber: trackingData[order.id]?.trackingNumber || '',
                                          trackingProvider: trackingData[order.id]?.trackingProvider || 'Shiprocket'
                                        }
                                      })}
                                      className="input-field text-xs py-1.5 w-full"
                                    />
                                    <button
                                      onClick={async () => {
                                        const tracking = trackingData[order.id]
                                        if (!tracking?.trackingNumber) {
                                          toast.error('Please enter tracking number')
                                          return
                                        }
                                        try {
                                          await fetch('/api/orders', {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              id: order.id,
                                              trackingNumber: tracking.trackingNumber,
                                              trackingProvider: tracking.trackingProvider,
                                              trackingUrl: tracking.trackingUrl
                                            })
                                          })
                                          toast.success('Tracking number added')
                                          loadData()
                                        } catch (error) {
                                          toast.error('Failed to add tracking number')
                                        }
                                      }}
                                      className="w-full btn-primary text-xs py-1.5"
                                    >
                                      Add Tracking
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => toggleOrderDetails(order.id)}
                              className="flex-1 btn-secondary text-xs py-1.5 px-3"
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              title="Delete Order"
                            >
                              <FiTrash2 className="inline" />
                            </button>
                          </div>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-sm md:text-base">No delivered orders found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Deleted Orders Tab */}
      {activeTab === 'deletedOrders' && (
        <div className="px-2 md:px-0">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Deleted Orders</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading deleted orders...</p>
            </div>
          ) : (
            <div>
              {deletedOrders.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {deletedOrders.map((order: any) => {
                    const isExpanded = expandedOrders.has(order.id)
                    return (
                    <div key={order.id} className="card p-2.5 md:p-3">
                      <div className="flex items-start justify-between gap-2 md:gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm md:text-base truncate">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-gray-400 text-xs truncate">{order.userEmail}</p>
                          <p className="text-gray-400 text-xs">User: {order.userName || 'N/A'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 whitespace-nowrap">
                            {order.status === 'cancelled' ? 'Cancelled' : 'Deleted'}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-300 space-y-3">
                          <div className="grid grid-cols-2 gap-2 md:gap-3">
                            <div>
                              <p className="text-gray-400 text-xs mb-0.5">Artwork</p>
                              <p className="font-medium text-xs md:text-sm">{order.artworkTitle}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-0.5">Quantity</p>
                              <p className="font-medium text-xs md:text-sm">{order.quantity || 1}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-0.5">Unit Price</p>
                              <p className="font-medium text-xs md:text-sm">₹{order.unitPrice || order.total}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-0.5">Total Price</p>
                              <p className="text-gray-900 font-bold text-sm md:text-base">₹{order.total}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-0.5">Payment</p>
                              <p className="font-medium text-xs md:text-sm">
                                {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-0.5">Order Date</p>
                              <p className="font-medium text-xs md:text-sm">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {order.paymentMethod === 'cod' && (
                            <div className="p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-400/20">
                              <p className="text-gray-400 text-xs mb-1">Delivery Address</p>
                              <p className="text-gray-900 text-xs md:text-sm">
                                {order.fullName || 'N/A'}<br />
                                {order.address1 || ''}<br />
                                {order.address2 && `${order.address2}, `}
                                {order.city || ''}, {order.state || ''} - {order.pincode || ''}<br />
                                {order.phone || ''}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="flex-1 btn-secondary text-xs py-1.5 px-3"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          title="Permanently Delete Order"
                        >
                          <FiTrash2 className="inline" />
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm md:text-base">No deleted orders found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="px-2 md:px-0">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">All Users</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-4">
              {users.map((user: any) => (
                <div key={user.id} className="card p-2 md:p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-base md:text-lg">{user.name || user.email?.split('@')[0]}</p>
                          <p className="text-gray-400 text-xs md:text-sm">{user.email}</p>
                          <p className="text-gray-400 text-xs md:text-sm">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {user.disabled && (
                          <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                      <button
                        onClick={() => handleDisableUser(user.id, !user.disabled)}
                        className={`btn-secondary text-xs md:text-sm py-1.5 md:py-2 px-3 md:px-4 ${
                          user.disabled ? 'text-green-600 hover:text-green-700' : 'text-yellow-600 hover:text-yellow-700'
                        }`}
                      >
                        {user.disabled ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn-secondary text-xs md:text-sm py-1.5 md:py-2 px-3 md:px-4 text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Artists Tab */}
      {activeTab === 'artists' && (
        <div className="px-2 md:px-0">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Artists</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-2 md:mb-4">
            <div className="card p-2 md:p-4 bg-gradient-to-br from-purple-50 via-white to-orange-50 border border-purple-100">
              <p className="text-xs text-gray-500 mb-1">Total Artists</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-600">{artists.length}</p>
            </div>
            <div className="card p-2 md:p-4 border border-yellow-100 bg-yellow-50/50">
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600">{pendingArtists.length}</p>
            </div>
            <div className="card p-2 md:p-4 border border-green-100 bg-green-50/50">
              <p className="text-xs text-gray-500 mb-1">Approved</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">{approvedArtists.length}</p>
            </div>
            <div className="card p-2 md:p-4 border border-red-100 bg-red-50/50">
              <p className="text-xs text-gray-500 mb-1">Rejected</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">{rejectedArtists.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setArtistStatusFilter(status as 'all' | 'pending' | 'approved' | 'rejected')}
                className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-all ${
                  artistStatusFilter === status
                    ? 'bg-purple-600 text-white border-transparent'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading artists...</p>
            </div>
          ) : filteredArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4">
              {filteredArtists.map((artist: any) => (
                <div key={artist.id} className="card p-2 md:p-5 border-l-4 border-l-purple-500">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-base md:text-lg text-gray-900">{artist.artistName}</p>
                      <p className="text-xs text-gray-500">{artist.email}</p>
                      <p className="text-xs text-gray-400">
                        Joined: {new Date(artist.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        artist.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : artist.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {artist.status.charAt(0).toUpperCase() + artist.status.slice(1)}
                    </span>
                  </div>

                  {artist.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{artist.bio}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-3">
                    <div>
                      <p className="text-gray-400">Commission</p>
                      <p className="font-semibold text-gray-900">{artist.commissionRate || 70}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Verification</p>
                      <p className="font-semibold text-gray-900">
                        {artist.verificationStatus?.charAt(0).toUpperCase() + artist.verificationStatus?.slice(1)}
                      </p>
                    </div>
                  </div>

                  {artist.portfolio && artist.portfolio.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Portfolio</p>
                      <div className="flex flex-wrap gap-2">
                        {artist.portfolio.slice(0, 3).map((link: string, idx: number) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:text-purple-700 underline"
                          >
                            Link {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleViewArtistArtworks(artist)}
                      className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-2"
                    >
                      <FiEye className="text-sm" />
                      View Artworks ({artist.totalArtworks || 0})
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {artist.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleArtistStatusChange(artist.id, 'approved')}
                            className="flex-1 btn-primary text-xs py-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleArtistStatusChange(artist.id, 'rejected')}
                            className="flex-1 btn-secondary text-xs py-2 text-red-600 hover:text-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {artist.status === 'approved' && (
                        <>
                          <button
                            onClick={() => handleArtistStatusChange(artist.id, 'rejected')}
                            className="flex-1 btn-secondary text-xs py-2 text-gray-900 hover:text-orange-700"
                          >
                            Disable
                          </button>
                          <button
                            onClick={() => handleDeleteArtist(artist)}
                            className="flex-1 btn-secondary text-xs py-2 text-red-600 hover:text-red-700 border-red-300"
                          >
                            Remove
                          </button>
                        </>
                      )}
                      {artist.status === 'rejected' && (
                        <>
                          <button
                            onClick={() => handleArtistStatusChange(artist.id, 'approved')}
                            className="flex-1 btn-primary text-xs py-2"
                          >
                            Re-approve
                          </button>
                          <button
                            onClick={() => handleDeleteArtist(artist)}
                            className="flex-1 btn-secondary text-xs py-2 text-red-600 hover:text-red-700 border-red-300"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm md:text-base">No artists found for this filter.</p>
            </div>
          )}
        </div>
      )}

      {/* Support Messages Tab */}
      {activeTab === 'support' && (
        <div className="px-2 md:px-0">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Support Messages</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading messages...</p>
            </div>
          ) : supportMessages.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageSquare className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No support messages yet</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-4">
              {supportMessages.map((message: any) => (
                <div key={message.id} className="card p-2 md:p-4">
                  <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-base md:text-lg mb-1">{message.subject}</h3>
                          <p className="text-gray-400 text-xs md:text-sm mb-1.5">
                            From: {message.userName} ({message.userEmail})
                          </p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1.5 ${
                            message.type === 'order' ? 'bg-blue-500/20 text-blue-400' :
                            message.type === 'website' ? 'bg-purple-500/20 text-purple-400' :
                            message.type === 'other' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                          </span>
                          {message.orderId && (
                            <p className="text-gray-400 text-xs md:text-sm mb-1.5">
                              Related Order: #{message.orderId.slice(0, 8)}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium ${
                          message.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          message.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                          message.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 whitespace-pre-wrap">{message.message}</p>
                      {message.images && message.images.length > 0 && (
                        <div className="mb-2 md:mb-3">
                          <p className="text-gray-700 font-medium text-xs md:text-sm mb-1.5">Attached Images ({message.images.length}):</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {message.images.map((image: string, index: number) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Attachment ${index + 1}`}
                                  className="w-full h-20 md:h-24 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-orange-400 transition-colors"
                                  onClick={() => window.open(image, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs opacity-0 group-hover:opacity-100">Click to view</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {message.adminResponse && (
                        <div className="mt-2 md:mt-3 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-400/20">
                          <p className="text-gray-900 font-medium mb-1 text-xs md:text-sm">Admin Response:</p>
                          <p className="text-gray-600 text-xs md:text-sm whitespace-pre-wrap">{message.adminResponse}</p>
                        </div>
                      )}
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 md:gap-2">
                      <select
                        value={message.status}
                        onChange={async (e) => {
                          try {
                            await updateSupportMessage(message.id, { status: e.target.value })
                            toast.success('Status updated')
                            loadData()
                          } catch (error) {
                            toast.error('Failed to update status')
                          }
                        }}
                        className="input-field text-xs md:text-sm py-1.5"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => {
                          setSelectedMessage(message)
                          setAdminResponse(message.adminResponse || '')
                        }}
                        className="btn-secondary text-xs md:text-sm py-1.5 px-3"
                      >
                        {message.adminResponse ? 'Edit Response' : 'Add Response'}
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this message?')) {
                            try {
                              await deleteSupportMessage(message.id)
                              toast.success('Message deleted')
                              loadData()
                            } catch (error) {
                              toast.error('Failed to delete message')
                            }
                          }
                        }}
                        className="btn-secondary text-xs md:text-sm py-1.5 px-3 text-red-400"
                      >
                        <FiX className="inline mr-1 text-xs" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Response Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Admin Response</h3>
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Message from: {selectedMessage.userEmail}</p>
              <p className="text-gray-600 mb-2 whitespace-pre-wrap">{selectedMessage.message}</p>
              {selectedMessage.images && selectedMessage.images.length > 0 && (
                <div className="mt-3">
                  <p className="text-gray-700 font-medium text-sm mb-2">Attached Images ({selectedMessage.images.length}):</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedMessage.images.map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-24 md:h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-orange-400 transition-colors"
                          onClick={() => window.open(image, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 group-hover:opacity-100">Click to view</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Response</label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="input-field"
                rows={6}
                placeholder="Type your response here..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  try {
                    await updateSupportMessage(selectedMessage.id, { 
                      adminResponse: adminResponse,
                      status: adminResponse ? 'resolved' : selectedMessage.status
                    })
                    toast.success('Response saved')
                    setSelectedMessage(null)
                    setAdminResponse('')
                    loadData()
                  } catch (error) {
                    toast.error('Failed to save response')
                  }
                }}
                className="btn-primary flex-1"
              >
                <FiCheck className="inline mr-2" />
                Save Response
              </button>
              <button
                onClick={() => {
                  setSelectedMessage(null)
                  setAdminResponse('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artwork Form Modal */}
      {showArtworkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">
              {editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field text-sm py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field text-sm py-2"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field text-sm py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1.5">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field text-sm py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5 flex items-center gap-2">
                  <FiUser className="text-base" />
                  Artist (Optional)
                </label>
                <select
                  value={formData.artistId}
                  onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                  className="input-field text-sm py-2"
                >
                  <option value="">No Artist / Platform Artwork</option>
                  {artists.filter((a: any) => a.status === 'approved').map((artist: any) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.artistName} ({artist.commissionRate}% commission)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select an approved artist to link this artwork. Commission will be calculated automatically.
                </p>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1.5">
                  Images (up to 6) *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="input-field text-xs md:text-sm py-2"
                  required={!editingArtwork}
                />
                {formData.images.length > 0 && (
                  <p className="text-xs md:text-sm text-gray-400 mt-1.5">
                    {formData.images.length} image(s) selected
                  </p>
                )}
                {(imagePreviews.length > 0 || (editingArtwork && editingArtwork.images?.length > 0)) && (
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3">
                    {(imagePreviews.length > 0 ? imagePreviews : editingArtwork?.images || []).map((preview: string, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 md:h-32 object-cover rounded-lg border-2 border-gray-400/30"
                        />
                        {editingArtwork && !formData.images.length && (
                          <span className="absolute top-1 right-1 bg-gray-50 px-1.5 py-0.5 rounded text-xs">
                            Current
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1.5">
                  * Images will be visible on the user page after adding the artwork
                </p>
              </div>
              <div className="flex gap-3 md:gap-4">
                <button type="submit" className="btn-primary flex-1 text-sm md:text-base py-2">
                  {editingArtwork ? 'Update' : 'Add'} Artwork
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowArtworkForm(false)
                    setEditingArtwork(null)
                    setFormData({ title: '', description: '', price: '', category: '', artistId: '', images: [] })
                    setImagePreviews([])
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="btn-secondary flex-1 text-sm md:text-base py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card p-4 md:p-6 max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">Confirm Delete</h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Are you sure you want to delete this artwork?</p>
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm md:text-base font-medium rounded-lg transition-all bg-gray-900 text-white hover:bg-gray-800"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setArtworkToDelete(null)
                }}
                className="btn-secondary flex-1 text-sm md:text-base py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Delete Confirmation Modal */}
      {showUserDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card p-4 md:p-6 max-w-md w-full bg-white">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">Confirm Delete User</h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
              Are you sure you want to delete this user? This will remove them from the system. This action cannot be undone.
            </p>
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={confirmDeleteUser}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm md:text-base font-medium rounded-lg transition-all bg-gray-900 text-white hover:bg-gray-800"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowUserDeleteConfirm(false)
                  setUserToDelete(null)
                }}
                className="btn-secondary flex-1 text-sm md:text-base py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artist Artworks View Modal */}
      {showArtistArtworks && selectedArtistForArtworks && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card p-4 md:p-6 max-w-5xl w-full bg-white max-h-[90vh] overflow-y-auto my-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Artworks by {selectedArtistForArtworks.artistName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedArtistForArtworks.email} • {artistArtworks.length} {artistArtworks.length === 1 ? 'artwork' : 'artworks'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowArtistArtworks(false)
                  setSelectedArtistForArtworks(null)
                  setArtistArtworks([])
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            {loadingArtworks ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading artworks...</p>
              </div>
            ) : artistArtworks.length === 0 ? (
              <div className="text-center py-12">
                <FiImage className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No artworks found</p>
                <p className="text-gray-500 text-sm">This artist hasn't uploaded any artworks yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {artistArtworks.map((artwork: any) => (
                  <div key={artwork.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Artwork Images */}
                    {artwork.images && artwork.images.length > 0 && (
                      <div className="relative">
                        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                          {artwork.images.map((image: string, idx: number) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`${artwork.title} - Image ${idx + 1}`}
                              className="w-full h-64 object-cover snap-center"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-artwork.jpg'
                              }}
                            />
                          ))}
                        </div>
                        {artwork.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                            {artwork.images.length} images
                          </div>
                        )}
                      </div>
                    )}

                    {/* Artwork Details */}
                    <div className="p-4 md:p-5">
                      <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {artwork.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {artwork.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs text-gray-500">Price</span>
                          <p className="font-bold text-lg text-orange-600">₹{artwork.price?.toFixed(2) || '0.00'}</p>
                        </div>
                        {artwork.category && (
                          <div>
                            <span className="text-xs text-gray-500">Category</span>
                            <p className="font-semibold text-sm text-gray-700">{artwork.category}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-200">
                        <FiImage className="text-sm" />
                        <span>Created: {new Date(artwork.createdAt).toLocaleDateString()}</span>
                        {artwork.likes > 0 && (
                          <>
                            <span>•</span>
                            <span>{artwork.likes} likes</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Artist Delete Confirmation Modal */}
      {showArtistDeleteConfirm && artistToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="card p-4 md:p-6 max-w-md w-full bg-white">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">
              Confirm Remove Artist
            </h3>
            <div className="mb-4 md:mb-6 space-y-3">
              <p className="text-gray-700 text-sm md:text-base">
                Are you sure you want to permanently remove <strong>{artistToDelete.artistName}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                <p className="text-red-800 text-sm font-semibold mb-2">⚠️ Warning:</p>
                <ul className="text-red-700 text-xs md:text-sm space-y-1 list-disc list-inside">
                  <li>This action cannot be undone</li>
                  <li>All artworks by this artist will be permanently deleted</li>
                  <li>The artist profile will be completely removed from the system</li>
                  <li>Any pending commissions will be cancelled</li>
                </ul>
              </div>
              {artistToDelete.totalArtworks > 0 && (
                <p className="text-gray-600 text-sm">
                  This will delete <strong>{artistToDelete.totalArtworks}</strong> artwork(s) associated with this artist.
                </p>
              )}
            </div>
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={confirmDeleteArtist}
                disabled={deletingArtist}
                className="btn-primary flex-1 text-sm md:text-base py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingArtist ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Removing...
                  </span>
                ) : (
                  'Yes, Remove Artist'
                )}
              </button>
              <button
                onClick={() => {
                  setShowArtistDeleteConfirm(false)
                  setArtistToDelete(null)
                }}
                disabled={deletingArtist}
                className="btn-secondary flex-1 text-sm md:text-base py-2 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Delete Confirmation Modal */}
      {showOrderDeleteConfirm && (() => {
        const order = orders.find(o => o.id === orderToDelete)
        const isHardDelete = order?.status === 'deleted' || order?.status === 'cancelled'
        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card p-4 md:p-6 max-w-md w-full bg-white">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">
              {isHardDelete ? 'Confirm Permanent Delete' : 'Confirm Delete Order'}
            </h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
              {isHardDelete 
                ? 'Are you sure you want to permanently delete this order? This action cannot be undone and the order will be completely removed from the system.'
                : 'Are you sure you want to delete this delivered order? It will be moved to the Deleted Orders section where you can permanently delete it later.'}
            </p>
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={confirmDeleteOrder}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm md:text-base font-medium rounded-lg transition-all bg-red-600 text-white hover:bg-red-700"
              >
                <FiTrash2 className="inline" />
                {isHardDelete ? 'Yes, Delete Permanently' : 'Yes, Move to Deleted'}
              </button>
              <button
                onClick={() => {
                  setShowOrderDeleteConfirm(false)
                  setOrderToDelete(null)
                }}
                className="btn-secondary flex-1 text-sm md:text-base py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        )
      })()}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-xs md:max-w-lg overflow-hidden rounded-xl md:rounded-3xl border border-white/40 bg-white/95 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.8)]">
            <div className="absolute -top-8 right-5 h-16 w-16 md:-top-16 md:right-10 md:h-32 md:w-32 rounded-full bg-orange-100 blur-2xl md:blur-3xl" />
            <div className="absolute -bottom-8 left-5 h-16 w-16 md:-bottom-16 md:left-10 md:h-32 md:w-32 rounded-full bg-pink-100 blur-2xl md:blur-3xl" />
            <div className="relative grid gap-3 md:gap-6 p-4 md:p-6 sm:p-8">
              <div className="flex items-center gap-2.5 md:gap-4">
                <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg shadow-gray-900/40">
                  <FiLogOut className="text-lg md:text-2xl" />
                </div>
                <div>
                  <p className="text-[9px] md:text-xs font-semibold uppercase tracking-wider md:tracking-[0.3em] text-gray-400">
                    SESSION
                  </p>
                  <h3 className="text-base md:text-2xl font-bold text-gray-900">Confirm Logout</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-gray-600">
                Are you sure you want to log out? You can sign back in anytime to keep managing Peter Art.
              </p>
              <div className="rounded-lg md:rounded-2xl border border-gray-100 bg-gray-50/60 p-2.5 md:p-4 text-xs md:text-sm text-gray-500">
                <p className="font-semibold text-gray-900 text-xs md:text-sm">Admin Panel</p>
                <p className="mt-0.5 md:mt-1 text-[10px] md:text-sm">
                  You can sign back in at any time to continue managing Peter Art.
                </p>
              </div>
              <div className="flex flex-col gap-2 md:gap-3 sm:flex-row">
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-lg md:rounded-2xl bg-gray-900 py-2 md:py-3 text-xs md:text-sm font-semibold text-white shadow-lg shadow-gray-900/40 transition hover:-translate-y-0.5 hover:bg-black"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-lg md:rounded-2xl border border-gray-200 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Mobile Only - Fixed at Bottom */}
      <nav 
        className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 md:hidden safe-area-bottom pointer-events-none" 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          width: '100%',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          margin: 0,
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))'
        }}
      >
        <div 
          className="pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between gap-2 rounded-2xl border border-gray-200/60 bg-white/95 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          style={{ 
            willChange: 'transform',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
        >
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95 ${
              activeTab === 'home'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiHome className="text-lg" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiPackage className="text-lg" />
            <span className="text-xs font-medium">Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95 ${
              activeTab === 'artists'
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiUser className="text-lg" />
            <span className="text-xs font-medium">Artists</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

