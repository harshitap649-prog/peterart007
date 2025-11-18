'use client'

import { useState } from 'react'
import { validateGiftCardCode } from '@/lib/giftcards'
import toast from 'react-hot-toast'
import { FiGift, FiX, FiCheck } from 'react-icons/fi'

interface GiftCardInputProps {
  onApply: (giftCard: any, amount: number) => void
  onRemove: () => void
  appliedGiftCard?: any
  maxAmount?: number
  language?: 'en' | 'hi'
}

export default function GiftCardInput({ 
  onApply, 
  onRemove, 
  appliedGiftCard, 
  maxAmount,
  language = 'en' 
}: GiftCardInputProps) {
  const [code, setCode] = useState('')
  const [amount, setAmount] = useState('')
  const [validating, setValidating] = useState(false)

  const translations = {
    en: {
      title: 'Gift Card',
      placeholder: 'Enter gift card code',
      amount: 'Amount to use',
      apply: 'Apply Gift Card',
      remove: 'Remove',
      invalid: 'Invalid gift card code',
      insufficient: 'Insufficient balance',
      expired: 'Gift card expired',
      applied: 'Gift card applied',
      maxAmount: 'Maximum amount'
    },
    hi: {
      title: 'गिफ्ट कार्ड',
      placeholder: 'गिफ्ट कार्ड कोड दर्ज करें',
      amount: 'उपयोग करने की राशि',
      apply: 'गिफ्ट कार्ड लागू करें',
      remove: 'हटाएं',
      invalid: 'अमान्य गिफ्ट कार्ड कोड',
      insufficient: 'अपर्याप्त शेष',
      expired: 'गिफ्ट कार्ड समाप्त हो गया',
      applied: 'गिफ्ट कार्ड लागू किया गया',
      maxAmount: 'अधिकतम राशि'
    }
  }

  const t = translations[language]

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error(t.invalid)
      return
    }

    setValidating(true)
    try {
      const validation = await validateGiftCardCode(code.trim().toUpperCase())
      
      if (!validation.valid) {
        toast.error(validation.error || t.invalid)
        return
      }

      const giftCard = validation.giftCard
      const useAmount = amount ? Math.min(parseFloat(amount), giftCard.balance, maxAmount || giftCard.balance) : Math.min(giftCard.balance, maxAmount || giftCard.balance)

      if (useAmount <= 0) {
        toast.error(t.insufficient)
        return
      }

      onApply(giftCard, useAmount)
      toast.success(t.applied)
      setCode('')
      setAmount('')
    } catch (error: any) {
      toast.error(error.message || t.invalid)
    } finally {
      setValidating(false)
    }
  }

  if (appliedGiftCard) {
    return (
      <div className="card p-4 bg-gradient-to-br from-orange-50 to-purple-50 border-2 border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <FiGift className="text-white text-lg" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{appliedGiftCard.code}</p>
              <p className="text-sm text-gray-600">
                {language === 'hi' ? 'लागू किया गया' : 'Applied'} - ₹{appliedGiftCard.appliedAmount || appliedGiftCard.balance}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <FiGift className="text-gray-900 text-lg" />
        <h3 className="font-semibold text-gray-900">{t.title}</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t.placeholder}
            className="input-field"
            maxLength={14}
            style={{ fontFamily: 'monospace', letterSpacing: '2px' }}
          />
        </div>
        
        {maxAmount && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t.amount}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`${t.maxAmount}: ₹${maxAmount}`}
              min="1"
              max={maxAmount}
              className="input-field"
            />
          </div>
        )}
        
        <button
          onClick={handleApply}
          disabled={validating || !code.trim()}
          className="btn-secondary w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {validating ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              {language === 'hi' ? 'जांच हो रही है...' : 'Validating...'}
            </>
          ) : (
            <>
              <FiCheck className="text-base" />
              {t.apply}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

