'use client'

import { useState, useEffect, useRef } from 'react'
import { getAllArtworks, addArtwork, updateArtwork, deleteArtwork } from '@/lib/artworks'
import { getAllOrders, updateOrderStatus, getOrdersByStatus } from '@/lib/orders'
import { getAllUsers, disableUser, deleteUser } from '@/lib/users'
import { getAllSupportMessages, updateSupportMessage, deleteSupportMessage } from '@/lib/support'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiHome, FiShoppingBag, FiUsers, FiPackage, FiMessageSquare, FiCheck, FiX, FiSearch } from 'react-icons/fi'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [artworks, setArtworks] = useState<any[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [supportMessages, setSupportMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [showArtworkForm, setShowArtworkForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null)
  const [editingArtwork, setEditingArtwork] = useState<any>(null)
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    images: [] as File[]
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        const arts = await getAllArtworks()
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
      if (activeTab === 'support' || activeTab === 'home') {
        const messages = await getAllSupportMessages()
        setSupportMessages(messages)
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
          category: formData.category.trim()
        }, formData.images)
        toast.success('Artwork updated successfully')
      } else {
        await addArtwork({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category.trim()
        }, formData.images)
        toast.success('Artwork added successfully')
      }
      
      // Reset form and close modal
      setShowArtworkForm(false)
      setEditingArtwork(null)
      setFormData({ title: '', description: '', price: '', category: '', images: [] })
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
  

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status)
      toast.success('Order status updated')
      loadData()
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const leftOrders = orders.filter(o => o.status === 'left')

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
            activeTab === 'home' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <FiHome className="inline mr-1 md:mr-2 text-xs md:text-sm" />
          Home
        </button>
        <button
          onClick={() => setActiveTab('artworks')}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
            activeTab === 'artworks' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <FiShoppingBag className="inline mr-1 md:mr-2 text-xs md:text-sm" />
          All Artworks
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
            activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <FiPackage className="inline mr-1 md:mr-2 text-xs md:text-sm" />
          All Orders
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
            activeTab === 'users' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <FiUsers className="inline mr-1 md:mr-2 text-xs md:text-sm" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
            activeTab === 'support' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <FiMessageSquare className="inline mr-1 md:mr-2 text-xs md:text-sm" />
          Support Messages
          {supportMessages.filter((m: any) => m.status === 'pending').length > 0 && (
            <span className="ml-1.5 md:ml-2 px-1.5 md:px-2 py-0.5 bg-red-500 text-gray-900 text-xs rounded-full">
              {supportMessages.filter((m: any) => m.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Home Tab */}
      {activeTab === 'home' && (
        <div>
          {/* Logo at top */}
          <div className="text-center mb-6 md:mb-8">
            <div className="relative w-32 h-32 md:w-44 md:h-44 mx-auto mb-3 md:mb-4 overflow-hidden" style={{ borderRadius: '0 0 50% 50%' }}>
              <img
                src="https://png.pngtree.com/png-vector/20240618/ourmid/pngtree-a-cute-girl-dancing-colorful-art-design-png-image_12793513.png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="card p-3 md:p-4">
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
        <div>
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold">All Artworks</h2>
            <button
              onClick={() => {
                setEditingArtwork(null)
                setFormData({ title: '', description: '', price: '', category: '', images: [] })
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
          ) : (
            <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
              {filteredArtworks.map((artwork: any) => (
                <div key={artwork.id} className="card p-2 md:p-3 lg:p-4">
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
                  <p className="text-gray-900 font-bold text-sm md:text-base lg:text-lg mb-2 md:mb-3">₹{artwork.price}</p>
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
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">All Orders</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading orders...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Orders Section */}
              {pendingOrders.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">Pending Orders ({pendingOrders.length})</h3>
                  <div className="space-y-4">
                    {pendingOrders.map((order: any) => (
                      <div key={order.id} className="card p-3 md:p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2 md:mb-3">
                              <div>
                                <p className="font-bold text-base md:text-lg">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-gray-400 text-xs md:text-sm">{order.userEmail}</p>
                                <p className="text-gray-400 text-xs md:text-sm">User: {order.userName || 'N/A'}</p>
                              </div>
                              <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                Pending
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
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
                                <p className="text-gray-900 font-bold text-base md:text-xl">₹{order.total}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-0.5">Payment</p>
                                <p className="font-medium text-xs md:text-sm">
                                  {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                </p>
                              </div>
                            </div>

                            {order.paymentMethod === 'cod' && (
                              <div className="mt-3 md:mt-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-400/20">
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
                          <div className="flex-shrink-0">
                            <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-600">
                              Status
                            </label>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                              className="input-field text-xs md:text-sm py-1.5"
                            >
                              <option value="pending">Pending</option>
                              <option value="delivered">Delivered</option>
                              <option value="left">Left</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivered Orders Section */}
              {deliveredOrders.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">Delivered Orders ({deliveredOrders.length})</h3>
                  <div className="space-y-4">
                    {deliveredOrders.map((order: any) => (
                      <div key={order.id} className="card p-3 md:p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2 md:mb-3">
                              <div>
                                <p className="font-bold text-base md:text-lg">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-gray-400 text-xs md:text-sm">{order.userEmail}</p>
                                <p className="text-gray-400 text-xs md:text-sm">User: {order.userName || 'N/A'}</p>
                              </div>
                              <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                Delivered
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
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
                                <p className="text-gray-900 font-bold text-base md:text-xl">₹{order.total}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-0.5">Payment</p>
                                <p className="font-medium text-xs md:text-sm">
                                  {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                </p>
                              </div>
                            </div>

                            {order.paymentMethod === 'cod' && (
                              <div className="mt-3 md:mt-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-400/20">
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
                          <div className="flex-shrink-0">
                            <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-600">
                              Status
                            </label>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                              className="input-field text-xs md:text-sm py-1.5"
                            >
                              <option value="pending">Pending</option>
                              <option value="delivered">Delivered</option>
                              <option value="left">Left</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Left Orders Section */}
              {leftOrders.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">Left Orders ({leftOrders.length})</h3>
                  <div className="space-y-4">
                    {leftOrders.map((order: any) => (
                      <div key={order.id} className="card p-3 md:p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2 md:mb-3">
                              <div>
                                <p className="font-bold text-base md:text-lg">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-gray-400 text-xs md:text-sm">{order.userEmail}</p>
                                <p className="text-gray-400 text-xs md:text-sm">User: {order.userName || 'N/A'}</p>
                              </div>
                              <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                Left
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
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
                                <p className="text-gray-900 font-bold text-base md:text-xl">₹{order.total}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-0.5">Payment</p>
                                <p className="font-medium text-xs md:text-sm">
                                  {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                </p>
                              </div>
                            </div>

                            {order.paymentMethod === 'cod' && (
                              <div className="mt-3 md:mt-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-400/20">
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
                          <div className="flex-shrink-0">
                            <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-600">
                              Status
                            </label>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                              className="input-field text-xs md:text-sm py-1.5"
                            >
                              <option value="pending">Pending</option>
                              <option value="delivered">Delivered</option>
                              <option value="left">Left</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Orders Message */}
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">No orders found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">All Users</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {users.map((user: any) => (
                <div key={user.id} className="card p-3 md:p-4">
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

      {/* Support Messages Tab */}
      {activeTab === 'support' && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Support Messages</h2>
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
            <div className="space-y-3 md:space-y-4">
              {supportMessages.map((message: any) => (
                <div key={message.id} className="card p-3 md:p-4">
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
              <p className="text-gray-600 mb-2">{selectedMessage.message}</p>
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
                    setFormData({ title: '', description: '', price: '', category: '', images: [] })
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
    </div>
  )
}

