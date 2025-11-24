'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getArtistByUserId } from '@/lib/artists'
import toast from 'react-hot-toast'
import { FiMessageCircle, FiUser, FiSearch, FiArrowLeft, FiClock } from 'react-icons/fi'

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [artist, setArtist] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadConversations()
      // Auto-refresh conversations every 5 seconds
      const interval = setInterval(() => {
        loadConversations()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        toast.error('Please login to continue')
        router.push('/')
        return
      }
      setUser(currentUser)
      
      // Check if user is an artist
      const artistData = await getArtistByUserId(currentUser.uid)
      if (artistData) {
        setArtist(artistData)
      }
    } catch (error) {
      console.error('Error loading user:', error)
      toast.error('Failed to load user')
      router.push('/')
    }
  }

  const loadConversations = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/messages?userId=${user.uid}`)
      if (response.ok) {
        const allConversations = await response.json()
        
        // Process conversations to get unique users
        const conversationMap = new Map()
        
        allConversations.forEach((conv: any[]) => {
          conv.forEach((msg: any) => {
            // Determine the other user in the conversation
            const otherUserId = msg.senderId === user.uid ? msg.receiverId : msg.senderId
            const conversationId = msg.conversationId
            
            if (!conversationMap.has(otherUserId)) {
              conversationMap.set(otherUserId, {
                userId: otherUserId,
                conversationId,
                lastMessage: msg,
                unreadCount: 0,
                messages: []
              })
            }
            
            const convData = conversationMap.get(otherUserId)
            convData.messages.push(msg)
            
            // Update last message if this is newer
            if (new Date(msg.createdAt) > new Date(convData.lastMessage.createdAt)) {
              convData.lastMessage = msg
            }
            
            // Count unread messages
            if (msg.receiverId === user.uid && !msg.read) {
              convData.unreadCount++
            }
          })
        })
        
        // Convert to array and sort by last message time
        const conversationsList = Array.from(conversationMap.values())
          .map((conv: any) => {
            // Get user info for each conversation
            return {
              ...conv,
              userName: 'Loading...',
              userEmail: null,
              profileImage: null
            }
          })
          .sort((a, b) => 
            new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
          )
        
        // Load user info for each conversation
        const conversationsWithInfo = await Promise.all(
          conversationsList.map(async (conv) => {
            try {
              const userResponse = await fetch(`/api/users/${conv.userId}`)
              if (userResponse.ok) {
                const userData = await userResponse.json()
                return {
                  ...conv,
                  userName: userData.displayName || userData.email?.split('@')[0] || 'User',
                  userEmail: userData.email,
                  profileImage: userData.profileImage || null
                }
              } else {
                // Try to get artist info
                const artistData = await getArtistByUserId(conv.userId)
                if (artistData) {
                  return {
                    ...conv,
                    userName: artistData.artistName,
                    userEmail: artistData.email || null,
                    profileImage: artistData.profileImage || null
                  }
                }
              }
            } catch (error) {
              console.error('Error loading user info:', error)
            }
            return conv
          })
        )
        
        setConversations(conversationsWithInfo)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date: string) => {
    const msgDate = new Date(date)
    const now = new Date()
    const diffInHours = (now.getTime() - msgDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return msgDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return msgDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const filteredConversations = conversations.filter((conv: any) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff3eb] via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff3eb] via-white to-white">
      {/* Header */}
      <div className="glass-panel border-b border-white/20 backdrop-blur-xl bg-white/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4 mb-5">
            <button
              onClick={() => router.back()}
              className="p-2.5 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110"
            >
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiMessageCircle className="text-white text-xl" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Messages
              </h1>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FiMessageCircle className="text-5xl text-orange-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-600 text-lg">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start a conversation by messaging an artist or user!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => router.push(`/chat/${conv.userId}`)}
                className="glass-panel p-5 rounded-xl hover:shadow-xl cursor-pointer transition-all transform hover:scale-[1.02] border border-white/20"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.profileImage ? (
                      <img
                        src={conv.profileImage}
                        alt={conv.userName}
                        className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-lg ring-2 ring-orange-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-4 border-white shadow-lg ring-2 ring-orange-100">
                        <span className="text-white text-xl font-bold">
                          {conv.userName[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-white text-xs font-bold">{conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900 truncate">{conv.userName}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-3 font-medium">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    {conv.userEmail && (
                      <p className="text-sm text-gray-500 truncate mb-2">{conv.userEmail}</p>
                    )}
                    <p className={`text-base truncate ${
                      conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                    }`}>
                      {conv.lastMessage.message || 'No message text'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

