'use client'

import { useState } from 'react'
import { FiTag, FiCheck, FiX } from 'react-icons/fi'
import { validateCoupon } from '@/lib/coupons'
import toast from 'react-hot-toast'

interface CouponInputProps {
  onCouponApplied: (coupon: any, discount: number) => void
  onCouponRemoved: () => void
  cartTotal: number
  userId: string
  language?: 'en' | 'hi'
}

export default function CouponInput({
  onCouponApplied,
  onCouponRemoved,
  cartTotal,
  userId,
  language = 'en'
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  const translations = {
    en: {
      applyCoupon: 'Apply Coupon',
      enterCode: 'Enter coupon code',
      applied: 'Coupon applied!',
      remove: 'Remove',
      discount: 'Discount',
      invalidCoupon: 'Invalid coupon code',
      processing: 'Processing...'
    },
    hi: {
      applyCoupon: 'कूपन लागू करें',
      enterCode: 'कूपन कोड दर्ज करें',
      applied: 'कूपन लागू किया गया!',
      remove: 'हटाएं',
      discount: 'छूट',
      invalidCoupon: 'अमान्य कूपन कोड',
      processing: 'प्रसंस्करण...'
    }
  }

  const t = translations[language]

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error(language === 'en' ? 'Please enter a coupon code' : 'कृपया कूपन कोड दर्ज करें')
      return
    }

    setLoading(true)
    try {
      const result = await validateCoupon(code, userId, cartTotal)
      
      if (result.valid) {
        setAppliedCoupon(result.coupon)
        setDiscount(result.discount)
        onCouponApplied(result.coupon, result.discount)
        toast.success(t.applied)
      } else {
        toast.error(result.error || t.invalidCoupon)
      }
    } catch (error: any) {
      toast.error(error.message || t.invalidCoupon)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCode('')
    onCouponRemoved()
    toast.success(language === 'en' ? 'Coupon removed' : 'कूपन हटा दिया गया')
  }

  return (
    <div className="space-y-2">
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t.enterCode}
              className="input-field pl-10 pr-4 py-2.5 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
            />
          </div>
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="btn-primary px-4 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FiTag className="text-sm" />
                {t.applyCoupon}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600 text-lg" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                {appliedCoupon.code} {t.applied}
              </p>
              <p className="text-xs text-green-700">
                {t.discount}: ₹{discount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        </div>
      )}
    </div>
  )
}

