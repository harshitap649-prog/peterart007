'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getArtistByUserId, getArtistArtworks, getArtistSales, updateArtistProfile } from '@/lib/artists'
import { getArtworkById, addArtwork, updateArtwork, deleteArtwork } from '@/lib/artworks'
import { getArtistCommissions, getPendingCommissions, requestPayout } from '@/lib/commissions'
import { getArtistFollowers } from '@/lib/follows'
import toast from 'react-hot-toast'
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiPackage, 
  FiImage, 
  FiCalendar, 
  FiBarChart2,
  FiEdit,
  FiEye,
  FiShoppingBag,
  FiPercent,
  FiArrowRight,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCreditCard,
  FiSave,
  FiUser,
  FiUpload,
  FiPlus,
  FiTrash2,
  FiHeart,
  FiX,
  FiUsers,
  FiMessageCircle,
  FiMail
} from 'react-icons/fi'

interface ArtistDashboardProps {
  userId: string
  language?: 'en' | 'hi'
}

export default function ArtistDashboard({ userId, language = 'en' }: ArtistDashboardProps) {
  const router = useRouter()
  const [artist, setArtist] = useState<any>(null)
  const [artworks, setArtworks] = useState<any[]>([])
  const [sales, setSales] = useState<any>(null)
  const [commissions, setCommissions] = useState<any[]>([])
  const [pendingCommissions, setPendingCommissions] = useState<any[]>([])
  const [selectedCommissions, setSelectedCommissions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'analytics' | 'commissions' | 'payouts' | 'profile' | 'followers' | 'messages'>('overview')
  const [followers, setFollowers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loadingFollowers, setLoadingFollowers] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileFormData, setProfileFormData] = useState({
    artistName: '',
    bio: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [payouts, setPayouts] = useState<any[]>([])
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: ''
  })
  const [savingBankDetails, setSavingBankDetails] = useState(false)
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
  const [showArtworkForm, setShowArtworkForm] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<any>(null)
  const [artworkFormData, setArtworkFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    images: [] as File[],
    imagePreviews: [] as string[]
  })
  const [submittingArtwork, setSubmittingArtwork] = useState(false)
  const [deletingArtwork, setDeletingArtwork] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const translations = {
    en: {
      overview: 'Overview',
      portfolio: 'Portfolio',
      analytics: 'Analytics',
      commissions: 'Commissions',
      totalArtworks: 'Total Artworks',
      totalSales: 'Total Sales',
      totalRevenue: 'Total Revenue',
      totalEarnings: 'Total Earnings',
      commissionRate: 'Commission Rate',
      recentSales: 'Recent Sales',
      pendingOrders: 'Pending Orders',
      deliveredOrders: 'Delivered Orders',
      salesLast30Days: 'Sales (Last 30 Days)',
      noArtworks: 'No artworks yet. Start by creating your first artwork!',
      viewArtwork: 'View Artwork',
      refresh: 'Refresh',
      orderId: 'Order ID',
      customer: 'Customer',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
      artworkTitle: 'Artwork',
      quantity: 'Qty',
      platformFee: 'Platform Fee',
      yourEarnings: 'Your Earnings',
      performance: 'Performance',
      salesChart: 'Sales Chart',
      revenueChart: 'Revenue Chart',
      loading: 'Loading...',
      error: 'Error loading data',
      pendingCommissions: 'Pending Commissions',
      paidCommissions: 'Paid Commissions',
      totalPending: 'Total Pending',
      requestPayout: 'Request Payout',
      selectCommissions: 'Select commissions to request payout',
      noCommissions: 'No commissions yet',
      commissionAmount: 'Commission',
      orderAmount: 'Order Amount',
      commissionStatus: 'Status',
      commissionDate: 'Date',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      payoutRequested: 'Payout requested successfully',
      payoutFailed: 'Failed to request payout',
      processing: 'Processing',
      paid: 'Paid',
      pending: 'Pending',
      cancelled: 'Cancelled',
      payouts: 'Payouts',
      payoutHistory: 'Payout History',
      bankDetails: 'Bank Details',
      updateBankDetails: 'Update Bank Details',
      accountName: 'Account Holder Name',
      accountNumber: 'Account Number',
      ifscCode: 'IFSC Code',
      bankName: 'Bank Name',
      save: 'Save',
      saved: 'Bank details saved successfully',
      saveFailed: 'Failed to save bank details',
      noPayouts: 'No payout requests yet',
      payoutId: 'Payout ID',
      totalAmount: 'Total Amount',
      requestedAt: 'Requested At',
      completedAt: 'Completed At',
      completed: 'Completed',
      failed: 'Failed',
      addArtwork: 'Add Artwork',
      editArtwork: 'Edit Artwork',
      deleteArtwork: 'Delete Artwork',
      artworkFormTitle: 'Artwork Title',
      artworkFormDescription: 'Description',
      artworkPrice: 'Price (₹)',
      artworkCategory: 'Category',
      artworkImages: 'Images',
      addImages: 'Add Images',
      saveArtwork: 'Save Artwork',
      artworkAdded: 'Artwork added successfully',
      artworkUpdated: 'Artwork updated successfully',
      artworkDeleted: 'Artwork deleted successfully',
      confirmDelete: 'Confirm Delete',
      deleteWarning: 'Are you sure you want to delete this artwork? This action cannot be undone.',
      totalLikes: 'Total Likes',
      totalViews: 'Total Views',
      averageRating: 'Average Rating',
      engagementRate: 'Engagement Rate',
      orders: 'Orders',
      views: 'Views',
      likes: 'Likes',
      editProfile: 'Edit Profile',
      saveProfile: 'Save Profile',
      profile: 'Profile',
      cancelEdit: 'Cancel',
      profileUpdated: 'Profile updated successfully',
      profileUpdateFailed: 'Failed to update profile',
      minimumPayout: 'Minimum Payout',
      minimumPayoutAmount: 'Minimum payout amount is ₹500',
      insufficientAmount: 'Insufficient amount for payout. Minimum is ₹500',
      followers: 'Followers',
      messages: 'Messages',
      myFollowers: 'My Followers',
      myMessages: 'My Messages',
      noFollowers: 'No followers yet',
      noMessages: 'No messages yet',
      followerName: 'Name',
      followerEmail: 'Email',
      followedAt: 'Followed At',
      messageFrom: 'From',
      messageText: 'Message',
      messageDate: 'Date',
      reply: 'Reply',
      viewProfile: 'View Profile'
    },
    hi: {
      overview: 'अवलोकन',
      portfolio: 'पोर्टफोलियो',
      analytics: 'विश्लेषण',
      totalArtworks: 'कुल कलाकृतियाँ',
      totalSales: 'कुल बिक्री',
      totalRevenue: 'कुल राजस्व',
      totalEarnings: 'कुल आय',
      commissionRate: 'कमीशन दर',
      recentSales: 'हाल की बिक्री',
      pendingOrders: 'लंबित ऑर्डर',
      deliveredOrders: 'डिलीवर किए गए ऑर्डर',
      salesLast30Days: 'बिक्री (पिछले 30 दिन)',
      noArtworks: 'अभी तक कोई कलाकृतियाँ नहीं। अपनी पहली कलाकृति बनाकर शुरू करें!',
      viewArtwork: 'कलाकृति देखें',
      refresh: 'ताज़ा करें',
      orderId: 'ऑर्डर आईडी',
      customer: 'ग्राहक',
      amount: 'राशि',
      status: 'स्थिति',
      date: 'तारीख',
      artworkTitle: 'कलाकृति',
      quantity: 'मात्रा',
      platformFee: 'प्लेटफ़ॉर्म शुल्क',
      yourEarnings: 'आपकी आय',
      performance: 'प्रदर्शन',
      salesChart: 'बिक्री चार्ट',
      revenueChart: 'राजस्व चार्ट',
      loading: 'लोड हो रहा है...',
      error: 'डेटा लोड करने में त्रुटि',
      commissions: 'कमीशन',
      pendingCommissions: 'लंबित कमीशन',
      paidCommissions: 'भुगतान किए गए कमीशन',
      totalPending: 'कुल लंबित',
      requestPayout: 'भुगतान अनुरोध करें',
      selectCommissions: 'भुगतान के लिए कमीशन चुनें',
      noCommissions: 'अभी तक कोई कमीशन नहीं',
      commissionAmount: 'कमीशन',
      orderAmount: 'ऑर्डर राशि',
      commissionStatus: 'स्थिति',
      commissionDate: 'तारीख',
      selectAll: 'सभी चुनें',
      deselectAll: 'सभी अचयनित करें',
      payoutRequested: 'भुगतान अनुरोध सफलतापूर्वक किया गया',
      payoutFailed: 'भुगतान अनुरोध करने में विफल',
      processing: 'प्रसंस्करण',
      paid: 'भुगतान किया गया',
      pending: 'लंबित',
      cancelled: 'रद्द',
      payouts: 'भुगतान',
      payoutHistory: 'भुगतान इतिहास',
      bankDetails: 'बैंक विवरण',
      updateBankDetails: 'बैंक विवरण अपडेट करें',
      accountName: 'खाता धारक का नाम',
      accountNumber: 'खाता संख्या',
      ifscCode: 'IFSC कोड',
      bankName: 'बैंक का नाम',
      save: 'सहेजें',
      saved: 'बैंक विवरण सफलतापूर्वक सहेजे गए',
      saveFailed: 'बैंक विवरण सहेजने में विफल',
      noPayouts: 'अभी तक कोई भुगतान अनुरोध नहीं',
      payoutId: 'भुगतान आईडी',
      totalAmount: 'कुल राशि',
      requestedAt: 'अनुरोधित तिथि',
      completedAt: 'पूर्ण तिथि',
      completed: 'पूर्ण',
      failed: 'विफल',
      addArtwork: 'कलाकृति जोड़ें',
      editArtwork: 'कलाकृति संपादित करें',
      deleteArtwork: 'कलाकृति हटाएं',
      artworkFormTitle: 'कलाकृति शीर्षक',
      artworkFormDescription: 'विवरण',
      artworkPrice: 'मूल्य (₹)',
      artworkCategory: 'श्रेणी',
      artworkImages: 'छवियां',
      addImages: 'छवियां जोड़ें',
      saveArtwork: 'कलाकृति सहेजें',
      artworkAdded: 'कलाकृति सफलतापूर्वक जोड़ी गई',
      artworkUpdated: 'कलाकृति सफलतापूर्वक अपडेट की गई',
      artworkDeleted: 'कलाकृति सफलतापूर्वक हटाई गई',
      confirmDelete: 'हटाने की पुष्टि करें',
      deleteWarning: 'क्या आप वाकई इस कलाकृति को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।',
      totalLikes: 'कुल लाइक',
      totalViews: 'कुल दृश्य',
      averageRating: 'औसत रेटिंग',
      engagementRate: 'एंगेजमेंट दर',
      orders: 'ऑर्डर',
      views: 'दृश्य',
      likes: 'लाइक',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      saveProfile: 'प्रोफ़ाइल सहेजें',
      profile: 'प्रोफ़ाइल',
      cancelEdit: 'रद्द करें',
      profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई',
      profileUpdateFailed: 'प्रोफ़ाइल अपडेट करने में विफल',
      minimumPayout: 'न्यूनतम भुगतान',
      minimumPayoutAmount: 'न्यूनतम भुगतान राशि ₹500 है',
      insufficientAmount: 'भुगतान के लिए अपर्याप्त राशि। न्यूनतम ₹500 है',
      followers: 'फॉलोअर्स',
      messages: 'संदेश',
      myFollowers: 'मेरे फॉलोअर्स',
      myMessages: 'मेरे संदेश',
      noFollowers: 'अभी तक कोई फॉलोअर्स नहीं',
      noMessages: 'अभी तक कोई संदेश नहीं',
      followerName: 'नाम',
      followerEmail: 'ईमेल',
      followedAt: 'फॉलो किया गया',
      messageFrom: 'से',
      messageText: 'संदेश',
      messageDate: 'तारीख',
      reply: 'जवाब दें',
      viewProfile: 'प्रोफ़ाइल देखें'
    }
  }

  const t = translations[language]

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    try {
      const artistData = await getArtistByUserId(userId)
      if (!artistData) {
        toast.error('Artist profile not found')
        return
      }
      setArtist(artistData)
      
      // Set profile form data
      setProfileFormData({
        artistName: artistData.artistName || '',
        bio: artistData.bio || ''
      })

      // Load artworks
      const artworksData = await getArtistArtworks(artistData.id)
      setArtworks(artworksData)

      // Load sales
      const salesData = await getArtistSales(artistData.id)
      setSales(salesData)

      // Load commissions
      const commissionsData = await getArtistCommissions(artistData.id)
      setCommissions(commissionsData)
      
      const pendingData = await getPendingCommissions(artistData.id)
      setPendingCommissions(pendingData)

      // Load payouts (only if approved)
      if (artistData.status === 'approved') {
        try {
          const payoutsResponse = await fetch(`/api/commissions/payout?artistId=${artistData.id}`)
          if (payoutsResponse.ok) {
            const payoutsData = await payoutsResponse.json()
            setPayouts(payoutsData)
          }
        } catch (error) {
          console.error('Error loading payouts:', error)
        }

        // Load bank details
        if (artistData.bankDetails) {
          setBankDetails(artistData.bankDetails)
        }
      }

      // Load followers and messages
      await loadFollowers(artistData.id)
      await loadMessages(artistData.userId)
    } catch (error: any) {
      console.error('Error loading artist data:', error)
      toast.error(t.error)
    } finally {
      setLoading(false)
    }
  }

  const loadFollowers = async (artistId: string) => {
    setLoadingFollowers(true)
    try {
      const followersData = await getArtistFollowers(artistId)
      // Get user info for each follower
      const followersWithInfo = await Promise.all(
        followersData.map(async (follow: any) => {
          try {
            const userResponse = await fetch(`/api/users/${follow.userId}`)
            if (userResponse.ok) {
              const userData = await userResponse.json()
              return {
                ...follow,
                userName: userData.displayName || userData.email?.split('@')[0] || 'Unknown',
                userEmail: userData.email || 'No email'
              }
            }
            return {
              ...follow,
              userName: 'Unknown User',
              userEmail: 'No email'
            }
          } catch (error) {
            return {
              ...follow,
              userName: 'Unknown User',
              userEmail: 'No email'
            }
          }
        })
      )
      setFollowers(followersWithInfo)
    } catch (error) {
      console.error('Error loading followers:', error)
    } finally {
      setLoadingFollowers(false)
    }
  }

  const loadMessages = async (artistUserId: string) => {
    setLoadingMessages(true)
    try {
      const response = await fetch(`/api/messages?userId=${artistUserId}`)
      if (response.ok) {
        const conversations = await response.json()
        // Flatten conversations and get unique senders
        const allMessages: any[] = []
        conversations.forEach((conv: any[]) => {
          conv.forEach((msg: any) => {
            if (msg.receiverId === artistUserId && !allMessages.find(m => m.senderId === msg.senderId)) {
              allMessages.push(msg)
            }
          })
        })
        
        // Get user info for each message sender
        const messagesWithInfo = await Promise.all(
          allMessages.map(async (msg: any) => {
            try {
              const userResponse = await fetch(`/api/users/${msg.senderId}`)
              if (userResponse.ok) {
                const userData = await userResponse.json()
                return {
                  ...msg,
                  senderName: userData.displayName || userData.email?.split('@')[0] || 'Unknown',
                  senderEmail: userData.email || 'No email'
                }
              }
              return {
                ...msg,
                senderName: 'Unknown User',
                senderEmail: 'No email'
              }
            } catch (error) {
              return {
                ...msg,
                senderName: 'Unknown User',
                senderEmail: 'No email'
              }
            }
          })
        )
        setMessages(messagesWithInfo)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
    toast.success(language === 'hi' ? 'डेटा ताज़ा किया गया' : 'Data refreshed')
  }

  const handleToggleCommission = (commissionId: string) => {
    setSelectedCommissions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commissionId)) {
        newSet.delete(commissionId)
      } else {
        newSet.add(commissionId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const allPendingIds = pendingCommissions.map((c: any) => c.id)
    setSelectedCommissions(new Set(allPendingIds))
  }

  const handleDeselectAll = () => {
    setSelectedCommissions(new Set())
  }

  const handleRequestPayout = async () => {
    if (selectedCommissions.size === 0) {
      toast.error(language === 'hi' ? 'कृपया कमीशन चुनें' : 'Please select commissions')
      return
    }

    if (!artist) return

    // Calculate total amount
    const totalAmount = pendingCommissions
      .filter((c: any) => selectedCommissions.has(c.id))
      .reduce((sum: number, c: any) => sum + c.commissionAmount, 0)

    // Check minimum payout (₹500)
    if (totalAmount < 500) {
      toast.error(t.insufficientAmount)
      return
    }

    setRequestingPayout(true)
    try {
      await requestPayout(artist.id, Array.from(selectedCommissions))
      toast.success(t.payoutRequested)
      setSelectedCommissions(new Set())
      await loadData()
    } catch (error: any) {
      console.error('Error requesting payout:', error)
      toast.error(error.message || t.payoutFailed)
    } finally {
      setRequestingPayout(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!artist) return

    if (!profileFormData.artistName.trim()) {
      toast.error(language === 'hi' ? 'कृपया कलाकार का नाम दर्ज करें' : 'Please enter artist name')
      return
    }

    setSavingProfile(true)
    try {
      await updateArtistProfile(artist.id, {
        artistName: profileFormData.artistName.trim(),
        bio: profileFormData.bio.trim()
      })
      toast.success(t.profileUpdated)
      setEditingProfile(false)
      await loadData()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || t.profileUpdateFailed)
    } finally {
      setSavingProfile(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="text-green-500" />
      case 'processing':
        return <FiClock className="text-yellow-500" />
      case 'cancelled':
        return <FiXCircle className="text-red-500" />
      default:
        return <FiClock className="text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSaveBankDetails = async () => {
    if (!artist) return

    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
      toast.error(language === 'hi' ? 'कृपया सभी बैंक विवरण भरें' : 'Please fill all bank details')
      return
    }

    setSavingBankDetails(true)
    try {
      await updateArtistProfile(artist.id, { bankDetails })
      toast.success(t.saved)
      await loadData() // Reload to get updated artist data
    } catch (error: any) {
      console.error('Error saving bank details:', error)
      toast.error(error.message || t.saveFailed)
    } finally {
      setSavingBankDetails(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-4 text-gray-600">{t.loading}</span>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t.error}</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !artist) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'hi' ? 'कृपया एक छवि फ़ाइल चुनें' : 'Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'hi' ? 'फ़ाइल का आकार 5MB से कम होना चाहिए' : 'File size must be less than 5MB')
      return
    }

    setUploadingProfileImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/artists/${artist.id}/upload-picture`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload profile image')
      }

      const data = await response.json()
      toast.success(language === 'hi' ? 'प्रोफ़ाइल छवि अपलोड की गई' : 'Profile image uploaded successfully')
      await loadData() // Reload to get updated artist data
    } catch (error: any) {
      console.error('Error uploading profile image:', error)
      toast.error(error.message || (language === 'hi' ? 'प्रोफ़ाइल छवि अपलोड करने में विफल' : 'Failed to upload profile image'))
    } finally {
      setUploadingProfileImage(false)
      // Reset input
      e.target.value = ''
    }
  }

  const formatDate = (dateString: string, includeTime = false) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit'
      })
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newFiles: File[] = []
    const newPreviews: string[] = []

    files.forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        newFiles.push(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          newPreviews.push(result)
          setArtworkFormData(prev => ({
            ...prev,
            imagePreviews: [...prev.imagePreviews, result]
          }))
        }
        reader.readAsDataURL(file)
      }
    })

    setArtworkFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }))
  }

  const removeImage = (index: number) => {
    setArtworkFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }))
  }

  const handleEditArtwork = async (artwork: any) => {
    setEditingArtwork(artwork)
    setArtworkFormData({
      title: artwork.title || '',
      description: artwork.description || '',
      price: artwork.price?.toString() || '',
      category: artwork.category || '',
      images: [],
      imagePreviews: artwork.images || []
    })
    setShowArtworkForm(true)
  }

  const handleDeleteArtworkClick = (artworkId: string) => {
    setArtworkToDelete(artworkId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteArtwork = async () => {
    if (!artworkToDelete || !artist) return

    setDeletingArtwork(artworkToDelete)
    try {
      await deleteArtwork(artworkToDelete)
      toast.success(t.artworkDeleted)
      setShowDeleteConfirm(false)
      setArtworkToDelete(null)
      await loadData()
    } catch (error: any) {
      console.error('Error deleting artwork:', error)
      toast.error(error.message || 'Failed to delete artwork')
    } finally {
      setDeletingArtwork(null)
    }
  }

  const handleArtworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!artist) return

    // Validation
    if (!artworkFormData.title.trim()) {
      toast.error(language === 'hi' ? 'कृपया शीर्षक दर्ज करें' : 'Please enter title')
      return
    }
    if (!artworkFormData.description.trim()) {
      toast.error(language === 'hi' ? 'कृपया विवरण दर्ज करें' : 'Please enter description')
      return
    }
    if (!artworkFormData.price || parseFloat(artworkFormData.price) <= 0) {
      toast.error(language === 'hi' ? 'कृपया वैध मूल्य दर्ज करें' : 'Please enter a valid price')
      return
    }
    if (editingArtwork && artworkFormData.images.length === 0 && artworkFormData.imagePreviews.length === 0) {
      toast.error(language === 'hi' ? 'कृपया कम से कम एक छवि चुनें' : 'Please select at least one image')
      return
    }
    if (!editingArtwork && artworkFormData.images.length === 0) {
      toast.error(language === 'hi' ? 'कृपया कम से कम एक छवि चुनें' : 'Please select at least one image')
      return
    }

    setSubmittingArtwork(true)
    try {
      if (editingArtwork) {
        await updateArtwork(editingArtwork.id, {
          title: artworkFormData.title.trim(),
          description: artworkFormData.description.trim(),
          price: parseFloat(artworkFormData.price),
          category: artworkFormData.category.trim(),
          artistId: artist.id
        }, artworkFormData.images)
        toast.success(t.artworkUpdated)
      } else {
        await addArtwork({
          title: artworkFormData.title.trim(),
          description: artworkFormData.description.trim(),
          price: parseFloat(artworkFormData.price),
          category: artworkFormData.category.trim(),
          artistId: artist.id
        }, artworkFormData.images)
        toast.success(t.artworkAdded)
      }

      // Reset form
      setShowArtworkForm(false)
      setEditingArtwork(null)
      setArtworkFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        images: [],
        imagePreviews: []
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      await loadData()
    } catch (error: any) {
      console.error('Error saving artwork:', error)
      toast.error(error.message || 'Failed to save artwork')
    } finally {
      setSubmittingArtwork(false)
    }
  }

  const calculateEngagementMetrics = () => {
    const totalLikes = artworks.reduce((sum, a) => sum + (a.likes || 0), 0)
    const totalViews = artworks.reduce((sum, a) => sum + (a.views || 0), 0)
    const totalOrders = sales?.totalSales || 0
    const avgRating = artworks.length > 0 
      ? artworks.reduce((sum, a) => sum + (a.rating || 0), 0) / artworks.length 
      : 0
    const engagementRate = totalViews > 0 
      ? ((totalLikes + totalOrders) / totalViews * 100).toFixed(1)
      : '0.0'

    return { totalLikes, totalViews, totalOrders, avgRating, engagementRate }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="relative">
            {artist.profileImage ? (
              <img
                src={artist.profileImage}
                alt={artist.artistName}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-200 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
                }}
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                <FiUser className="text-2xl md:text-3xl text-gray-400" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-orange-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-orange-700 transition-colors" title={language === 'hi' ? 'प्रोफ़ाइल छवि अपलोड करें' : 'Upload profile image'}>
              {uploadingProfileImage ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiEdit className="text-xs" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageUpload}
                disabled={uploadingProfileImage}
              />
            </label>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {artist.artistName}
            </h2>
            <p className="text-gray-600 text-sm md:text-base">{artist.bio || 'Artist Profile'}</p>
            {artist.status === 'pending' && (
              <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {language === 'hi' ? 'लंबित अनुमोदन' : 'Pending Approval'}
              </div>
            )}
            {artist.status === 'approved' && artist.verificationStatus === 'verified' && (
              <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {language === 'hi' ? 'सत्यापित कलाकार' : 'Verified Artist'}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            {t.refresh}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-orange-600 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.overview}
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'portfolio'
              ? 'border-orange-600 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.portfolio} ({artworks.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'analytics'
              ? 'border-orange-600 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.analytics}
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'commissions'
              ? 'border-orange-600 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.commissions}
          {pendingCommissions.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-orange-600 text-white text-xs rounded-full">
              {pendingCommissions.length}
            </span>
          )}
        </button>
        {artist.status === 'approved' && (
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'payouts'
                ? 'border-orange-600 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.payouts}
          </button>
        )}
        <button
          onClick={() => setActiveTab('followers')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'followers'
              ? 'border-orange-600 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.followers} ({followers.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'messages'
              ? 'border-orange-600 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.messages} ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-orange-600 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.profile}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <FiImage className="text-2xl text-gray-900" />
                <span className="text-xs text-gray-500">{t.totalArtworks}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{artworks.length}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <FiShoppingBag className="text-2xl text-green-600" />
                <span className="text-xs text-gray-500">{t.totalSales}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{sales?.totalSales || 0}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <FiDollarSign className="text-2xl text-blue-600" />
                <span className="text-xs text-gray-500">{t.totalRevenue}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {sales ? formatCurrency(sales.totalRevenue) : '₹0.00'}
              </p>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <FiTrendingUp className="text-2xl text-purple-600" />
                <span className="text-xs text-gray-500">{t.totalEarnings}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {sales ? formatCurrency(sales.totalEarnings) : '₹0.00'}
              </p>
            </div>
          </div>

          {/* Commission Info */}
          <div className="card p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiPercent className="text-gray-900" />
                {t.commissionRate}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t.commissionRate}</span>
                <span className="font-bold text-gray-900">{sales?.commissionRate || artist.commissionRate || 70}%</span>
              </div>
              {sales && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.yourEarnings}</span>
                    <span className="font-bold text-green-600">{formatCurrency(sales.totalEarnings)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.platformFee}</span>
                    <span className="font-bold text-gray-600">{formatCurrency(sales.platformFee)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          {sales && sales.orders && sales.orders.length > 0 && (
            <div className="card p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiPackage className="text-gray-900" />
                {t.recentSales}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">{t.orderId}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.artworkTitle}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.quantity}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.amount}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.status}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.date}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.orders.map((order: any) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-gray-900 font-mono text-xs">#{order.id.slice(-6)}</td>
                        <td className="py-3 text-gray-900">{order.artworkTitle || 'N/A'}</td>
                        <td className="py-3 text-gray-600">{order.quantity || 1}</td>
                        <td className="py-3 text-gray-900 font-medium">{formatCurrency(order.total || 0)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'confirmed' || order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600 text-xs">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          {/* Add Artwork Button */}
          {artist.status === 'approved' && (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{t.portfolio}</h3>
              <button
                onClick={() => {
                  setEditingArtwork(null)
                  setArtworkFormData({
                    title: '',
                    description: '',
                    price: '',
                    category: '',
                    images: [],
                    imagePreviews: []
                  })
                  setShowArtworkForm(true)
                }}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FiPlus />
                {t.addArtwork}
              </button>
            </div>
          )}

          {artworks.length === 0 ? (
            <div className="text-center py-12 card">
              <FiImage className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{t.noArtworks}</p>
              {artist.status === 'approved' ? (
                <button
                  onClick={() => {
                    setEditingArtwork(null)
                    setArtworkFormData({
                      title: '',
                      description: '',
                      price: '',
                      category: '',
                      images: [],
                      imagePreviews: []
                    })
                    setShowArtworkForm(true)
                  }}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <FiPlus />
                  {t.addArtwork}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  {language === 'hi' 
                    ? 'कृपया प्रशासक से संपर्क करें या अपने कार्यों को अपलोड करने के लिए प्रतीक्षा करें।'
                    : 'Please contact the administrator or wait for your artworks to be uploaded.'}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworks.map((artwork) => {
                const artworkOrders = sales?.orders?.filter((o: any) => o.artworkId === artwork.id) || []
                return (
                  <div
                    key={artwork.id}
                    className="card p-3 hover:shadow-lg transition-shadow"
                  >
                    {artwork.images && artwork.images[0] ? (
                      <div className="relative w-full h-32 md:h-40 mb-2 rounded-lg overflow-hidden group">
                        <img
                          src={artwork.images[0]}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
                          }}
                        />
                        {artist.status === 'approved' && (
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditArtwork(artwork)
                              }}
                              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                              title={t.editArtwork}
                            >
                              <FiEdit className="text-xs text-blue-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteArtworkClick(artwork.id)
                              }}
                              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                              title={t.deleteArtwork}
                            >
                              <FiTrash2 className="text-xs text-red-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-32 md:h-40 mb-2 rounded-lg bg-gray-200 flex items-center justify-center">
                        <FiImage className="text-2xl text-gray-400" />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{artwork.title}</h3>
                    <p className="text-orange-600 font-bold text-base mb-2">₹{artwork.price?.toFixed(2) || '0.00'}</p>
                    
                    {/* Engagement Metrics */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-1">
                        <FiHeart className="text-red-500" />
                        <span>{artwork.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiEye className="text-blue-500" />
                        <span>{artwork.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiShoppingBag className="text-green-500" />
                        <span>{artworkOrders.length}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/artwork/${artwork.id}`)}
                        className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                      >
                        <FiEye className="text-xs" />
                        {t.viewArtwork}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {sales || artworks.length > 0 ? (
            <>
              {/* Engagement Metrics */}
              {(() => {
                const metrics = calculateEngagementMetrics()
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <FiHeart className="text-2xl text-red-500" />
                        <span className="text-xs text-gray-500">{t.totalLikes}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalLikes}</p>
                    </div>
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <FiEye className="text-2xl text-blue-500" />
                        <span className="text-xs text-gray-500">{t.totalViews}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalViews}</p>
                    </div>
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <FiShoppingBag className="text-2xl text-green-500" />
                        <span className="text-xs text-gray-500">{t.orders}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
                    </div>
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <FiTrendingUp className="text-2xl text-purple-500" />
                        <span className="text-xs text-gray-500">{t.engagementRate}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{metrics.engagementRate}%</p>
                    </div>
                  </div>
                )
              })()}

              {/* Performance Metrics */}
              {sales && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-4 md:p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiBarChart2 className="text-gray-900" />
                      {t.performance}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">{t.totalSales}</span>
                          <span className="font-bold text-gray-900">{sales.totalSales}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (sales.totalSales / Math.max(1, sales.totalSales)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">{t.salesLast30Days}</span>
                          <span className="font-bold text-gray-900">{sales.recentSales}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (sales.recentSales / Math.max(1, sales.totalSales)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4 md:p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiTrendingUp className="text-gray-900" />
                      {t.revenueChart}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{t.totalRevenue}</span>
                        <span className="font-bold text-blue-600">{formatCurrency(sales.totalRevenue)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{t.yourEarnings}</span>
                        <span className="font-bold text-green-600">{formatCurrency(sales.totalEarnings)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{t.platformFee}</span>
                        <span className="font-bold text-gray-600">{formatCurrency(sales.platformFee)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Status Breakdown */}
              {sales && (
                <div className="card p-4 md:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiPackage className="text-gray-900" />
                    {language === 'hi' ? 'ऑर्डर स्थिति' : 'Order Status'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{t.pendingOrders}</p>
                      <p className="text-2xl font-bold text-yellow-600">{sales.byStatus?.pending || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{t.deliveredOrders}</p>
                      <p className="text-2xl font-bold text-green-600">{sales.byStatus?.delivered || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Performing Artworks */}
              {artworks.length > 0 && (
                <div className="card p-4 md:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-gray-900" />
                    {language === 'hi' ? 'शीर्ष प्रदर्शन करने वाली कलाकृतियां' : 'Top Performing Artworks'}
                  </h3>
                  <div className="space-y-3">
                    {artworks
                      .map(artwork => {
                        const artworkOrders = sales?.orders?.filter((o: any) => o.artworkId === artwork.id) || []
                        const engagement = (artwork.likes || 0) + (artwork.views || 0) + artworkOrders.length
                        return { ...artwork, engagement, orders: artworkOrders.length }
                      })
                      .sort((a, b) => b.engagement - a.engagement)
                      .slice(0, 5)
                      .map((artwork: any) => (
                        <div key={artwork.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {artwork.images && artwork.images[0] ? (
                            <img
                              src={artwork.images[0]}
                              alt={artwork.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <FiImage className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">{artwork.title}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <FiHeart className="text-red-500" />
                                {artwork.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiEye className="text-blue-500" />
                                {artwork.views || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiShoppingBag className="text-green-500" />
                                {artwork.orders}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">₹{artwork.price?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 card">
              <FiBarChart2 className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {language === 'hi' ? 'अभी तक कोई डेटा नहीं' : 'No data yet'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          {/* Pending Commissions Section */}
          {pendingCommissions.length > 0 && (
            <div className="card p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FiClock className="text-yellow-600" />
                  {t.pendingCommissions} ({pendingCommissions.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    {t.selectAll}
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    {t.deselectAll}
                  </button>
                  <button
                    onClick={handleRequestPayout}
                    disabled={selectedCommissions.size === 0 || requestingPayout}
                    className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requestingPayout ? t.loading : t.requestPayout}
                    {selectedCommissions.size > 0 && ` (${selectedCommissions.size})`}
                  </button>
                </div>
              </div>
              
              {selectedCommissions.size > 0 && (
                <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700 mb-2">
                    {t.selectCommissions}: <strong>{selectedCommissions.size}</strong>
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {language === 'hi' ? 'कुल राशि' : 'Total Amount'}: ₹
                    {pendingCommissions
                      .filter((c: any) => selectedCommissions.has(c.id))
                      .reduce((sum: number, c: any) => sum + c.commissionAmount, 0)
                      .toFixed(2)}
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium w-12">
                        <input
                          type="checkbox"
                          checked={selectedCommissions.size === pendingCommissions.length && pendingCommissions.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleSelectAll()
                            } else {
                              handleDeselectAll()
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.orderAmount}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.commissionAmount}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.commissionDate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCommissions.map((commission: any) => (
                      <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">
                          <input
                            type="checkbox"
                            checked={selectedCommissions.has(commission.id)}
                            onChange={() => handleToggleCommission(commission.id)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="py-3 text-gray-900 font-medium">
                          {formatCurrency(commission.orderAmount)}
                        </td>
                        <td className="py-3 text-green-600 font-bold">
                          {formatCurrency(commission.commissionAmount)}
                        </td>
                        <td className="py-3 text-gray-600 text-xs">
                          {formatDate(commission.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All Commissions */}
          <div className="card p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-gray-900" />
              {language === 'hi' ? 'सभी कमीशन' : 'All Commissions'}
            </h3>
            
            {commissions.length === 0 ? (
              <div className="text-center py-12">
                <FiDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">{t.noCommissions}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">{t.orderAmount}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.commissionAmount}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.commissionStatus}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.commissionDate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((commission: any) => (
                      <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-gray-900 font-medium">
                          {formatCurrency(commission.orderAmount)}
                        </td>
                        <td className="py-3 text-green-600 font-bold">
                          {formatCurrency(commission.commissionAmount)}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(commission.status)}`}>
                            {getStatusIcon(commission.status)}
                            {commission.status === 'pending' ? t.pending : 
                             commission.status === 'processing' ? t.processing :
                             commission.status === 'paid' ? t.paid : t.cancelled}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600 text-xs">
                          {formatDate(commission.createdAt)}
                          {commission.paidAt && (
                            <div className="text-green-600 mt-1">
                              {language === 'hi' ? 'भुगतान' : 'Paid'}: {formatDate(commission.paidAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payouts Tab - Only visible if approved */}
      {/* Followers Tab */}
      {activeTab === 'followers' && (
        <div className="card p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiUsers className="text-gray-900" />
            {t.myFollowers}
          </h3>

          {loadingFollowers ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">{t.loading}</p>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t.noFollowers}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followers.map((follower: any) => (
                <div
                  key={follower.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{follower.userName}</p>
                      <p className="text-sm text-gray-600 truncate">{follower.userEmail}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t.followedAt}: {new Date(follower.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/user?id=${follower.userId}`)}
                    className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
                  >
                    <FiUser className="text-sm" />
                    {t.viewProfile}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiMessageCircle className="text-gray-900" />
              {t.myMessages}
            </h3>
            <button
              onClick={() => router.push('/messages')}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
            >
              <FiMessageCircle className="text-sm" />
              {language === 'hi' ? 'सभी संदेश देखें' : 'View All Messages'}
            </button>
          </div>

          {loadingMessages ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">{t.loading}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t.noMessages}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.slice(0, 5).map((message: any, index: number) => (
                <div
                  key={message.id || index}
                  onClick={() => router.push(`/chat/${message.senderId}`)}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {message.senderName?.[0] ? (
                      <span className="text-gray-700 font-semibold text-lg">
                        {message.senderName[0].toUpperCase()}
                      </span>
                    ) : (
                      <FiUser className="text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">{message.senderName}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt || message.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{message.text || message.message || 'No message text'}</p>
                  </div>
                </div>
              ))}
              {messages.length > 5 && (
                <button
                  onClick={() => router.push('/messages')}
                  className="w-full btn-secondary py-2 text-sm"
                >
                  {language === 'hi' ? `+ ${messages.length - 5} और संदेश देखें` : `View ${messages.length - 5} more messages`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payouts' && artist.status === 'approved' && (
        <div className="space-y-6">
          {/* Bank Details Section */}
          <div className="card p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-gray-900" />
              {t.bankDetails}
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              {language === 'hi' ? 'भुगतान प्राप्त करने के लिए अपने बैंक विवरण अपडेट करें' : 'Update your bank details to receive payouts'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t.accountName} *</label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  className="input-field text-sm"
                  placeholder={language === 'hi' ? 'खाता धारक का नाम' : 'Account holder name'}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t.accountNumber} *</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="input-field text-sm"
                  placeholder={language === 'hi' ? 'खाता संख्या' : 'Account number'}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t.ifscCode} *</label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                  className="input-field text-sm"
                  maxLength={11}
                  placeholder={language === 'hi' ? 'IFSC कोड' : 'IFSC code'}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t.bankName} *</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="input-field text-sm"
                  placeholder={language === 'hi' ? 'बैंक का नाम' : 'Bank name'}
                />
              </div>
            </div>
            <button
              onClick={handleSaveBankDetails}
              disabled={savingBankDetails}
              className="btn-primary mt-4 flex items-center gap-2 text-sm"
            >
              <FiSave />
              {savingBankDetails ? t.loading : t.save}
            </button>
          </div>

          {/* Payout History */}
          <div className="card p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-gray-900" />
              {t.payoutHistory}
            </h3>

            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <FiDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">{t.noPayouts}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">{t.payoutId}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.totalAmount}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.commissionStatus}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.requestedAt}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t.completedAt}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout: any) => (
                      <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-gray-900 font-medium text-xs">
                          #{payout.id.slice(-8)}
                        </td>
                        <td className="py-3 text-green-600 font-bold">
                          {formatCurrency(payout.totalAmount)}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(payout.status)}`}>
                            {getStatusIcon(payout.status === 'completed' ? 'paid' : payout.status === 'failed' ? 'cancelled' : payout.status)}
                            {payout.status === 'pending' ? t.pending :
                             payout.status === 'processing' ? t.processing :
                             payout.status === 'completed' ? t.completed : t.failed}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600 text-xs">
                          {formatDate(payout.requestedAt, true)}
                        </td>
                        <td className="py-3 text-gray-600 text-xs">
                          {payout.completedAt ? formatDate(payout.completedAt, true) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Artwork Form Modal */}
      {showArtworkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card p-4 md:p-6 max-w-2xl w-full bg-white max-h-[90vh] overflow-y-auto my-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                {editingArtwork ? t.editArtwork : t.addArtwork}
              </h3>
              <button
                onClick={() => {
                  setShowArtworkForm(false)
                  setEditingArtwork(null)
                  setArtworkFormData({
                    title: '',
                    description: '',
                    price: '',
                    category: '',
                    images: [],
                    imagePreviews: []
                  })
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleArtworkSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.artworkFormTitle} *
                </label>
                <input
                  type="text"
                  value={artworkFormData.title}
                  onChange={(e) => setArtworkFormData({ ...artworkFormData, title: e.target.value })}
                  className="input-field"
                  placeholder={language === 'hi' ? 'कलाकृति शीर्षक' : 'Artwork title'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.artworkFormDescription} *
                </label>
                <textarea
                  value={artworkFormData.description}
                  onChange={(e) => setArtworkFormData({ ...artworkFormData, description: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder={language === 'hi' ? 'कलाकृति का विवरण' : 'Describe your artwork'}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.artworkPrice} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={artworkFormData.price}
                    onChange={(e) => setArtworkFormData({ ...artworkFormData, price: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.artworkCategory}
                  </label>
                  <input
                    type="text"
                    value={artworkFormData.category}
                    onChange={(e) => setArtworkFormData({ ...artworkFormData, category: e.target.value })}
                    className="input-field"
                    placeholder={language === 'hi' ? 'श्रेणी (वैकल्पिक)' : 'Category (optional)'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.artworkImages} *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="input-field"
                />
                {artworkFormData.imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {artworkFormData.imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'hi' 
                    ? 'कम से कम एक छवि अपलोड करें' 
                    : 'Upload at least one image'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submittingArtwork}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingArtwork ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t.loading}
                    </>
                  ) : (
                    <>
                      <FiSave />
                      {t.saveArtwork}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowArtworkForm(false)
                    setEditingArtwork(null)
                    setArtworkFormData({
                      title: '',
                      description: '',
                      price: '',
                      category: '',
                      images: [],
                      imagePreviews: []
                    })
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="btn-secondary flex-1"
                >
                  {t.cancelEdit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && artworkToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="card p-4 md:p-6 max-w-md w-full bg-white">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">
              {t.confirmDelete}
            </h3>
            <p className="text-gray-700 text-sm md:text-base mb-4 md:mb-6">
              {t.deleteWarning}
            </p>
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={confirmDeleteArtwork}
                disabled={deletingArtwork === artworkToDelete}
                className="btn-primary flex-1 text-sm md:text-base py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingArtwork === artworkToDelete ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t.loading}
                  </span>
                ) : (
                  t.deleteArtwork
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setArtworkToDelete(null)
                }}
                disabled={deletingArtwork === artworkToDelete}
                className="btn-secondary flex-1 text-sm md:text-base py-2 disabled:opacity-50"
              >
                {t.cancelEdit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

