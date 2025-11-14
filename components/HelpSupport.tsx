'use client'

import { useState } from 'react'
import { createSupportMessage } from '@/lib/support'
import { getUserOrders } from '@/lib/orders'
import toast from 'react-hot-toast'
import { FiHelpCircle, FiSend, FiMessageSquare } from 'react-icons/fi'

export default function HelpSupport({ user }: { user: any }) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
    orderId: ''
  })
  const [userOrders, setUserOrders] = useState<any[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!formData.subject.trim() || !formData.message.trim()) {
        toast.error('Please fill in all required fields')
        return
      }
      
      await createSupportMessage({
        userId: user?.uid || '',
        userEmail: user?.email || '',
        userName: user?.displayName || user?.email?.split('@')[0] || 'User',
        subject: formData.subject,
        message: formData.message,
        type: formData.type,
        orderId: formData.orderId || null
      })
      
      toast.success('Your message has been sent! We will get back to you soon.')
      setFormData({ type: 'general', subject: '', message: '', orderId: '' })
      setShowForm(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const loadUserOrders = async () => {
    if (user && userOrders.length === 0) {
      try {
        const orders = await getUserOrders(user.uid)
        setUserOrders(orders)
      } catch (error) {
        console.error('Error loading orders:', error)
      }
    }
  }

  if (showForm) {
    loadUserOrders()
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <FiHelpCircle className="text-3xl text-gray-900" />
        <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
      </div>

      {!showForm ? (
        <div className="text-center py-8">
          <FiMessageSquare className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-6">
            Need help? Have a question about your order or the website? We're here to help!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiSend />
            Contact Support
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Issue Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field"
              required
            >
              <option value="general">General Inquiry</option>
              <option value="order">Order Related</option>
              <option value="website">Website Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.type === 'order' && userOrders.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Related Order (Optional)
              </label>
              <select
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                className="input-field"
              >
                <option value="">Select an order</option>
                {userOrders.map((order: any) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id.slice(0, 8)} - {order.artworkTitle} - ₹{order.total}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input-field"
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="input-field"
              rows={6}
              placeholder="Please provide details about your issue or question..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <FiSend />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setFormData({ type: 'general', subject: '', message: '', orderId: '' })
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

