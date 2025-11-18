'use client'

import { useState } from 'react'
import { purchaseGiftCard } from '@/lib/giftcards'
import toast from 'react-hot-toast'
import { FiGift, FiMail, FiUser, FiMessageSquare, FiCalendar } from 'react-icons/fi'

interface GiftCardPurchaseProps {
  user: any
  onSuccess?: (giftCard: any) => void
  language?: 'en' | 'hi'
}

export default function GiftCardPurchase({ user, onSuccess, language = 'en' }: GiftCardPurchaseProps) {
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const translations = {
    en: {
      title: 'Purchase Gift Card',
      subtitle: 'Give the gift of art',
      amount: 'Gift Card Amount',
      customAmount: 'Custom Amount',
      recipientName: 'Recipient Name',
      recipientEmail: 'Recipient Email',
      message: 'Gift Message (Optional)',
      scheduleDelivery: 'Schedule Delivery',
      deliveryDate: 'Delivery Date',
      purchase: 'Purchase Gift Card',
      success: 'Gift card purchased successfully!',
      error: 'Failed to purchase gift card',
      required: 'This field is required'
    },
    hi: {
      title: 'गिफ्ट कार्ड खरीदें',
      subtitle: 'कला का उपहार दें',
      amount: 'गिफ्ट कार्ड राशि',
      customAmount: 'कस्टम राशि',
      recipientName: 'प्राप्तकर्ता का नाम',
      recipientEmail: 'प्राप्तकर्ता का ईमेल',
      message: 'उपहार संदेश (वैकल्पिक)',
      scheduleDelivery: 'डिलीवरी शेड्यूल करें',
      deliveryDate: 'डिलीवरी की तारीख',
      purchase: 'गिफ्ट कार्ड खरीदें',
      success: 'गिफ्ट कार्ड सफलतापूर्वक खरीदा गया!',
      error: 'गिफ्ट कार्ड खरीदने में विफल',
      required: 'यह फ़ील्ड आवश्यक है'
    }
  }

  const t = translations[language]

  const presetAmounts = [500, 1000, 2500, 5000, 10000]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalAmount = customAmount ? parseFloat(customAmount) : parseFloat(amount)
    
    if (!finalAmount || finalAmount <= 0) {
      toast.error(t.required)
      return
    }
    
    if (!recipientName || !recipientEmail) {
      toast.error(t.required)
      return
    }
    
    setSubmitting(true)
    
    try {
      const giftCard = await purchaseGiftCard({
        purchasedBy: user.uid,
        purchasedByName: user.displayName || user.email?.split('@')[0],
        amount: finalAmount,
        recipientName,
        recipientEmail,
        message,
        expiresInDays: 365
      })
      
      toast.success(t.success)
      onSuccess?.(giftCard)
      
      // Reset form
      setAmount('')
      setCustomAmount('')
      setRecipientName('')
      setRecipientEmail('')
      setMessage('')
      setScheduledDate('')
    } catch (error: any) {
      toast.error(error.message || t.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-purple-500 rounded-lg">
          <FiGift className="text-2xl text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-600 text-sm">{t.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            {t.amount}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmount(preset.toString())
                  setCustomAmount('')
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  amount === preset.toString()
                    ? 'border-orange-600 bg-orange-50 text-gray-900 font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <input
              type="number"
              placeholder={t.customAmount}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setAmount('')
              }}
              min="100"
              step="100"
              className="input-field"
            />
          </div>
        </div>

        {/* Recipient Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FiUser className="text-base" />
              {t.recipientName}
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              className="input-field"
              placeholder="Enter recipient name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FiMail className="text-base" />
              {t.recipientEmail}
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              className="input-field"
              placeholder="recipient@example.com"
            />
          </div>
        </div>

        {/* Gift Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FiMessageSquare className="text-base" />
            {t.message}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="input-field"
            placeholder="Write a personal message..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{message.length}/500</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            t.purchase
          )}
        </button>
      </form>
    </div>
  )
}

