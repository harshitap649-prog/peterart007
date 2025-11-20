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
    <div className="min-h-screen bg-gradient-to-b from-[#fff4ee] via-white to-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:py-8">
        {/* Header Card */}
        <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <FiArrowLeft />
              Back
            </button>
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <div className="relative">
                {otherUser?.profileImage ? (
                  <img
                    src={otherUser.profileImage}
                    alt={otherUser.name}
                    className="h-12 w-12 rounded-2xl object-cover shadow-inner"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-inner">
                    <FiUser />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400"></span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Chatting with</p>
                <h1 className="truncate text-lg font-bold text-gray-900">{otherUser?.name || 'Loading...'}</h1>
                <p className="text-xs text-gray-500">{otherUser?.email || 'Online now'}</p>
              </div>
            </div>
            <button className="rounded-2xl border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50">
              <FiMoreVertical className="text-xl" />
            </button>
          </div>
        </div>

        {/* Conversation Card */}
        <div className="flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_25px_90px_-50px_rgba(15,23,42,0.55)] backdrop-blur">
          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-8">
            {loading && messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-orange-400 border-t-transparent"></div>
                Loading conversation…
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <FiMessageCircle className="text-3xl" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">No messages yet</p>
                  <p className="text-sm text-gray-500">Say hi to start planning your next artwork.</p>
                </div>
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
                      {showDateSeparator && (
                        <div className="my-6 flex items-center justify-center">
                          <span className="rounded-full border border-gray-200 bg-white px-4 py-1 text-xs font-semibold text-gray-500 shadow-sm">
                            {formatDateSeparator(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                        <div className={`flex max-w-[80%] gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                            {isOwn ? (
                              user.photoURL ? (
                                <img src={user.photoURL} alt="You" className="h-8 w-8 rounded-full object-cover shadow-sm" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-white text-xs font-bold shadow-sm">
                                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                              )
                            ) : otherUser?.profileImage ? (
                              <img src={otherUser.profileImage} alt={otherUser.name} className="h-8 w-8 rounded-full object-cover shadow-sm" />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-bold shadow-sm">
                                {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} flex-1`}>
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                                isOwn
                                  ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-br-md'
                                  : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                              }`}
                            >
                              {msg.message}
                            </div>
                            <div className={`mt-1 flex items-center gap-1 text-xs ${isOwn ? 'flex-row-reverse text-gray-500' : 'text-gray-400'}`}>
                              {formatMessageTime(msg.createdAt)}
                              {isOwn && <FiCheck className={`text-xs ${msg.read ? 'text-emerald-400' : 'text-gray-400'}`} />}
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

          {/* Input area inside card */}
          <div className="border-t border-gray-100 bg-white/80 px-4 py-4 sm:px-6">
            <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-inner">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type your message…"
                rows={1}
                className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-1 text-sm text-gray-900 outline-none placeholder-gray-500"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg transition ${
                  newMessage.trim() && !sending
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/30 hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {sending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <FiSend />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] uppercase tracking-[0.3em] text-gray-400">
              Enter to send • Shift+Enter for newline
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

