'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiSend, FiUser, FiMessageCircle, FiCheck, FiMoreVertical, FiX } from 'react-icons/fi'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileModalImage, setProfileModalImage] = useState<string | null>(null)
  const [profileModalName, setProfileModalName] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPageVisibleRef = useRef(true)
  const lastMessageIdRef = useRef<string | null>(null)
  const conversationId = params.userId as string

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
        setOtherUser({
          id: conversationId,
          name: 'User',
          email: null,
          profileImage: null
        })
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

  const loadMessages = useCallback(async (silent = false) => {
    if (!user || !conversationId) return

    const convId = `${user.uid}_${conversationId}_direct`
    
    if (!silent) {
      setLoading(true)
    }
    
    try {
      const response = await fetch(`/api/messages?conversationId=${convId}`)
      if (response.ok) {
        const data = await response.json()
        
        // Only update if there are new messages (check last message ID)
        const latestMessageId = data.length > 0 ? data[data.length - 1].id : null
        if (latestMessageId !== lastMessageIdRef.current) {
          setMessages(data)
          lastMessageIdRef.current = latestMessageId
          
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
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }, [user, conversationId])

  useEffect(() => {
    loadUser()
    
    // Handle page visibility to pause refresh when tab is hidden
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (user && conversationId) {
      loadOtherUser()
      loadMessages()
      // Auto-refresh messages every 5 seconds (reduced from 2s) only when page is visible
      intervalRef.current = setInterval(() => {
        if (isPageVisibleRef.current) {
          loadMessages(true) // Silent refresh
        }
      }, 5000)
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [user, conversationId, loadMessages])

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

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !conversationId || sending) return

    const messageText = newMessage.trim()
    const convId = `${user.uid}_${conversationId}_direct`
    
    // Optimistic update - add message immediately
    const tempMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.uid,
      receiverId: conversationId,
      conversationId: convId,
      message: messageText,
      type: 'direct',
      createdAt: new Date().toISOString(),
      read: false
    }
    
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')
    setSending(true)
    
    // Scroll to bottom immediately
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.uid,
          receiverId: conversationId,
          conversationId: convId,
          message: messageText,
          type: 'direct'
        })
      })

      if (response.ok) {
        // Reload messages to get the real message with proper ID
        await loadMessages(true)
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
        toast.error('Failed to send message')
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
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
    <div className="fixed inset-0 flex flex-col bg-white md:bg-gradient-to-b md:from-[#fff4ee] md:via-white md:to-white w-full">
      <div className="flex h-full w-full flex-col md:mx-auto md:max-w-5xl md:gap-4 md:px-4 md:py-4">
        {/* Header - Full Width on Mobile, Square Corners, Smaller Fonts */}
        <div className="rounded-none border-b border-gray-200 bg-white p-2.5 shadow-sm md:rounded-3xl md:border md:border-white/70 md:bg-white/90 md:p-4 md:shadow-[0_25px_80px_-40px_rgba(15,23,42,0.35)] md:backdrop-blur">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-md border border-gray-200 p-1.5 text-gray-700 transition hover:bg-gray-50 active:scale-95 md:gap-2 md:rounded-full md:px-4 md:py-2"
            >
              <FiArrowLeft className="text-base md:text-lg" />
              <span className="hidden md:inline text-xs font-semibold">Back</span>
            </button>
            <div className="flex flex-1 items-center gap-2.5 min-w-0">
              <div 
                className="relative flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  if (otherUser?.profileImage) {
                    setProfileModalImage(otherUser.profileImage)
                    setProfileModalName(otherUser.name)
                    setShowProfileModal(true)
                  }
                }}
              >
                {otherUser?.profileImage ? (
                  <img
                    src={otherUser.profileImage}
                    alt={otherUser.name}
                    className="h-9 w-9 rounded-md object-cover shadow-sm md:h-12 md:w-12 md:rounded-2xl"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm md:h-12 md:w-12 md:rounded-2xl">
                    <FiUser className="text-sm md:text-lg" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 md:-bottom-1 md:-right-1 md:h-4 md:w-4"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 md:text-xs md:tracking-[0.3em]">Chatting with</p>
                <h1 className="truncate text-sm font-bold text-gray-900 md:text-lg">{otherUser?.name || 'Loading...'}</h1>
                <p className="truncate text-[10px] text-gray-500 md:text-xs">{otherUser?.email || 'Online now'}</p>
              </div>
            </div>
            <button className="rounded-md border border-gray-200 p-1.5 text-gray-600 transition hover:bg-gray-50 active:scale-95 md:rounded-2xl">
              <FiMoreVertical className="text-base md:text-xl" />
            </button>
          </div>
        </div>

        {/* Conversation Area - Full Height on Mobile */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-none border-0 bg-white md:rounded-3xl md:border md:border-white/70 md:bg-white/95 md:shadow-[0_25px_90px_-50px_rgba(15,23,42,0.55)] md:backdrop-blur">
          <div className="flex-1 overflow-y-auto px-2.5 py-2.5 sm:px-4 sm:py-4 md:px-6 md:py-8">
          {loading && messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-orange-400 border-t-transparent"></div>
                <p className="text-xs">Loading conversation…</p>
            </div>
          ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <FiMessageCircle className="text-2xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">No messages yet</p>
                  <p className="text-xs text-gray-500">Say hi to start planning your next artwork.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              {messages.map((msg: any, index: number) => {
                const isOwn = msg.senderId === user.uid
                const prevMsg = index > 0 ? messages[index - 1] : null
                const showAvatar = shouldShowAvatar(msg, prevMsg)
                const showDateSeparator = shouldShowDateSeparator(msg, prevMsg)
                
                return (
                  <div key={msg.id}>
                    {showDateSeparator && (
                        <div className="my-4 flex items-center justify-center">
                          <span className="rounded-full border border-gray-200 bg-white px-3 py-0.5 text-[10px] font-semibold text-gray-500 shadow-sm md:text-xs md:px-4 md:py-1">
                            {formatDateSeparator(msg.createdAt)}
                          </span>
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-0.5`}>
                        <div className={`flex max-w-[85%] gap-1.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-6 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                          {isOwn ? (
                            user.photoURL ? (
                                <img 
                                  src={user.photoURL} 
                                  alt="You" 
                                  className="h-6 w-6 rounded-full object-cover shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                                  onClick={() => {
                                    setProfileModalImage(user.photoURL)
                                    setProfileModalName(user.displayName || user.email?.split('@')[0] || 'You')
                                    setShowProfileModal(true)
                                  }}
                                />
                              ) : (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-white text-[10px] font-bold shadow-sm">
                                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )
                          ) : otherUser?.profileImage ? (
                              <img 
                                src={otherUser.profileImage} 
                                alt={otherUser.name} 
                                className="h-6 w-6 rounded-full object-cover shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => {
                                  setProfileModalImage(otherUser.profileImage)
                                  setProfileModalName(otherUser.name)
                                  setShowProfileModal(true)
                                }}
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-[10px] font-bold shadow-sm">
                                {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} flex-1`}>
                          <div
                              className={`rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                              isOwn
                                  ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-br-sm'
                                  : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                            }`}
                          >
                              {msg.message}
                          </div>
                            <div className={`mt-0.5 flex items-center gap-1 text-[10px] ${isOwn ? 'flex-row-reverse text-gray-500' : 'text-gray-400'}`}>
                              {formatMessageTime(msg.createdAt)}
                              {isOwn && <FiCheck className={`text-[10px] ${msg.read ? 'text-emerald-400' : 'text-gray-400'}`} />}
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

          {/* Input area - Full Width on Mobile, Smaller Fonts */}
          <div className="border-t border-gray-200 bg-white px-2.5 py-2 md:px-4 md:py-4 sm:px-6">
            <div className="flex items-end gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 shadow-inner md:rounded-2xl md:px-3 md:py-2">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type your message…"
                rows={1}
                className="max-h-28 min-h-[32px] flex-1 resize-none bg-transparent px-2 py-1.5 text-xs text-gray-900 outline-none placeholder-gray-500 md:min-h-[40px] md:text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition active:scale-95 md:h-11 md:w-11 md:rounded-2xl md:text-lg ${
                  newMessage.trim() && !sending
                    ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20 active:scale-90 md:shadow-lg md:shadow-gray-900/30 md:hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {sending ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent md:h-5 md:w-5" />
                ) : (
                  <FiSend />
                )}
              </button>
            </div>
            <p className="mt-1.5 hidden text-center text-[9px] uppercase tracking-wider text-gray-400 md:block md:text-[11px] md:tracking-[0.3em]">
              Enter to send • Shift+Enter for newline
            </p>
          </div>
        </div>
      </div>

      {/* Profile Image Modal */}
      {showProfileModal && profileModalImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 md:p-4 transition-all shadow-lg"
              aria-label="Close"
            >
              <FiX className="text-xl md:text-2xl" />
            </button>
            
            {/* Large Image */}
            <div className="text-center">
              <img
                src={profileModalImage}
                alt={profileModalName}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
                }}
              />
              <p className="mt-4 text-white text-lg font-semibold">{profileModalName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

