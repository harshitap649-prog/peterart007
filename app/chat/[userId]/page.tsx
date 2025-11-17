'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getArtistByUserId } from '@/lib/artists'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiSend, FiUser, FiMessageCircle, FiCheck, FiMoreVertical } from 'react-icons/fi'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationId = params.userId as string

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user && conversationId) {
      loadOtherUser()
      loadMessages()
      // Auto-refresh messages every 2 seconds
      const interval = setInterval(() => {
        loadMessages()
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [user, conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const formatMessageTime = (date: string) => {
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
        day: 'numeric',
        year: msgDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const formatDateSeparator = (date: string) => {
    const msgDate = new Date(date)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return msgDate.toLocaleDateString('en-US', { weekday: 'long' })
    return msgDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: msgDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const shouldShowAvatar = (currentMsg: any, prevMsg: any) => {
    if (!prevMsg) return true
    if (currentMsg.senderId !== prevMsg.senderId) return true
    const timeDiff = new Date(currentMsg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()
    return timeDiff > 5 * 60 * 1000 // 5 minutes
  }

  const shouldShowDateSeparator = (currentMsg: any, prevMsg: any) => {
    if (!prevMsg) return true
    const currentDate = new Date(currentMsg.createdAt).toDateString()
    const prevDate = new Date(prevMsg.createdAt).toDateString()
    return currentDate !== prevDate
  }

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        toast.error('Please login to continue')
        router.push('/')
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading user:', error)
      toast.error('Failed to load user')
      router.push('/')
    }
  }

  const loadOtherUser = async () => {
    if (!user || !conversationId) return
    
    try {
      // Try to get user info
      const userResponse = await fetch(`/api/users/${conversationId}`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setOtherUser({
          id: userData.uid || conversationId,
          name: userData.displayName || userData.email?.split('@')[0] || 'User',
          email: userData.email,
          profileImage: userData.profileImage || null
        })
      } else {
        // Try to get artist info
        const artist = await getArtistByUserId(conversationId)
        if (artist) {
          setOtherUser({
            id: artist.userId,
            name: artist.artistName,
            email: artist.email || null,
            profileImage: artist.profileImage || null
          })
        } else {
          setOtherUser({
            id: conversationId,
            name: 'User',
            email: null,
            profileImage: null
          })
        }
      }
    } catch (error) {
      console.error('Error loading other user:', error)
      setOtherUser({
        id: conversationId,
        name: 'User',
        email: null,
        profileImage: null
      })
    }
  }

  const loadMessages = async () => {
    if (!user || !conversationId) return

    const convId = `${user.uid}_${conversationId}_direct`
    
    if (messages.length === 0) {
      setLoading(true)
    }
    
    try {
      const response = await fetch(`/api/messages?conversationId=${convId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        // Mark messages as read
        try {
          await fetch('/api/messages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: convId, userId: user.uid })
          })
        } catch (e) {
          // Silently fail if marking as read fails
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !conversationId || sending) return

    setSending(true)
    try {
      const convId = `${user.uid}_${conversationId}_direct`
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.uid,
          receiverId: conversationId,
          conversationId: convId,
          message: newMessage,
          type: 'direct'
        })
      })

      if (response.ok) {
        setNewMessage('')
        loadMessages()
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl text-gray-700" />
          </button>
          
          {otherUser ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                {otherUser.profileImage ? (
                  <img
                    src={otherUser.profileImage}
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-100">
                    <FiUser className="text-white text-lg" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{otherUser.name}</h2>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                <FiUser className="text-gray-500" />
              </div>
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiMoreVertical className="text-xl text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading && messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageCircle className="text-4xl text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500">Start the conversation by sending a message!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg: any, index: number) => {
                const isOwn = msg.senderId === user.uid
                const prevMsg = index > 0 ? messages[index - 1] : null
                const showAvatar = shouldShowAvatar(msg, prevMsg)
                const showDateSeparator = shouldShowDateSeparator(msg, prevMsg)
                
                return (
                  <div key={msg.id}>
                    {/* Date Separator */}
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-6">
                        <div className="bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                          <span className="text-xs font-medium text-gray-600">
                            {formatDateSeparator(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Message */}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`flex gap-2 max-w-[75%] md:max-w-[65%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar - Only show if needed */}
                        <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'} w-8`}>
                          {isOwn ? (
                            user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt="You"
                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-white shadow-sm">
                                <span className="text-white text-xs font-semibold">
                                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            )
                          ) : otherUser?.profileImage ? (
                            <img
                              src={otherUser.profileImage}
                              alt={otherUser.name}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center border-2 border-white shadow-sm">
                              <span className="text-white text-xs font-semibold">
                                {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} flex-1`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                              isOwn
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <p className={`text-xs ${isOwn ? 'text-gray-500' : 'text-gray-400'}`}>
                              {formatMessageTime(msg.createdAt)}
                            </p>
                            {isOwn && (
                              <FiCheck className={`text-xs ${msg.read ? 'text-blue-500' : 'text-gray-400'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end bg-gray-100 rounded-2xl px-2 py-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  // Auto-resize textarea
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-2.5 bg-transparent border-0 focus:outline-none resize-none overflow-hidden text-gray-900 placeholder-gray-500"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className={`rounded-full p-2.5 transition-all flex-shrink-0 ${
                newMessage.trim() && !sending
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSend className="text-lg" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

