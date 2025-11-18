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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex-1">
              {artist ? 'Messages' : 'Messages'}
            </h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageCircle className="text-4xl text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start a conversation by messaging an artist or user!'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => router.push(`/chat/${conv.userId}`)}
                className="bg-white rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.profileImage ? (
                      <img
                        src={conv.profileImage}
                        alt={conv.userName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-100">
                        <span className="text-white text-lg font-semibold">
                          {conv.userName[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-white text-xs font-bold">{conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.userName}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    {conv.userEmail && (
                      <p className="text-xs text-gray-500 truncate mb-1">{conv.userEmail}</p>
                    )}
                    <p className={`text-sm truncate ${
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

