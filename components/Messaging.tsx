'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiSend, FiMessageCircle, FiX } from 'react-icons/fi'

interface MessagingProps {
  userId: string
  receiverId?: string
  orderId?: string
  conversationId?: string
  language?: 'en' | 'hi'
}

export default function Messaging({ userId, receiverId, orderId, conversationId, language = 'en' }: MessagingProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (conversationId || (userId && receiverId)) {
      loadMessages()
      // Auto-refresh messages every 3 seconds
      const interval = setInterval(() => {
        if (conversationId || (userId && receiverId)) {
          loadMessages()
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [conversationId, userId, receiverId])

  const loadMessages = async () => {
    const convId = conversationId || (userId && receiverId ? `${userId}_${receiverId}_direct` : null)
    if (!convId) {
      setLoading(false)
      return
    }
    
    if (messages.length === 0) {
      setLoading(true)
    }
    
    try {
      const response = await fetch(`/api/messages?conversationId=${convId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        // Mark messages as read
        if (userId && receiverId) {
          try {
            await fetch('/api/messages', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ conversationId: convId, userId })
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
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !receiverId) return

    setSending(true)
    try {
      const convId = conversationId || `${userId}_${receiverId}_direct`
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId,
          conversationId: convId,
          orderId,
          message: newMessage,
          type: orderId ? 'order' : 'direct'
        })
      })

      if (response.ok) {
        setNewMessage('')
        loadMessages()
        toast.success(language === 'hi' ? 'संदेश भेजा गया' : 'Message sent')
      }
    } catch (error) {
      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-96 border border-gray-200 rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FiMessageCircle className="text-4xl mx-auto mb-2" />
            <p>{language === 'hi' ? 'कोई संदेश नहीं' : 'No messages yet'}</p>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.senderId === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.senderId === userId ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      {receiverId && (
        <div className="border-t border-gray-200 p-3 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={language === 'hi' ? 'संदेश लिखें...' : 'Type a message...'}
            className="input-field flex-1"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="btn-primary px-4"
          >
            <FiSend />
          </button>
        </div>
      )}
    </div>
  )
}

