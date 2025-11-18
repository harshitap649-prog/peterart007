'use client'

import { useState } from 'react'
import { FiCreditCard, FiSmartphone, FiDollarSign, FiGlobe, FiCheck } from 'react-icons/fi'
import { processPayment } from '@/lib/payment'
import toast from 'react-hot-toast'

interface PaymentMethodsProps {
  amount: number
  orderId: string
  userDetails: {
    name: string
    email: string
    phone: string
  }
  onPaymentSuccess: (paymentData: any) => void
  onPaymentError: (error: Error) => void
  language?: 'en' | 'hi'
}

export default function PaymentMethods({
  amount,
  orderId,
  userDetails,
  onPaymentSuccess,
  onPaymentError,
  language = 'en'
}: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [processing, setProcessing] = useState(false)

  const translations = {
    en: {
      selectPayment: 'Select Payment Method',
      cards: 'Credit/Debit Cards',
      upi: 'UPI',
      wallets: 'Wallets',
      netbanking: 'Net Banking',
      processing: 'Processing...',
      payNow: 'Pay Now',
      securePayment: 'Secure payment powered by Razorpay',
      popular: 'Popular'
    },
    hi: {
      selectPayment: 'भुगतान विधि चुनें',
      cards: 'क्रेडिट/डेबिट कार्ड',
      upi: 'UPI',
      wallets: 'वॉलेट',
      netbanking: 'नेट बैंकिंग',
      processing: 'प्रसंस्करण...',
      payNow: 'अभी भुगतान करें',
      securePayment: 'Razorpay द्वारा संचालित सुरक्षित भुगतान',
      popular: 'लोकप्रिय'
    }
  }

  const t = translations[language]

  const paymentMethods = [
    {
      id: 'cards',
      name: t.cards,
      icon: FiCreditCard,
      description: 'Visa, Mastercard, RuPay',
      popular: true
    },
    {
      id: 'upi',
      name: t.upi,
      icon: FiSmartphone,
      description: 'Google Pay, PhonePe, Paytm',
      popular: true
    },
    {
      id: 'wallets',
      name: t.wallets,
      icon: FiDollarSign,
      description: 'Paytm, PhonePe, Amazon Pay',
      popular: false
    },
    {
      id: 'netbanking',
      name: t.netbanking,
      icon: FiGlobe,
      description: 'All major banks',
      popular: false
    }
  ]

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error(language === 'en' ? 'Please select a payment method' : 'कृपया भुगतान विधि चुनें')
      return
    }

    setProcessing(true)
    try {
      const paymentData = await processPayment(amount, orderId, userDetails, {
        method: selectedMethod
      })
      onPaymentSuccess(paymentData)
    } catch (error: any) {
      console.error('Payment error:', error)
      onPaymentError(error)
      if (error.message && !error.message.includes('cancelled')) {
        toast.error(error.message || (language === 'en' ? 'Payment failed' : 'भुगतान विफल'))
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
        {t.selectPayment}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod === method.id
          
          return (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`relative p-4 border-2 rounded-lg transition-all text-left ${
                isSelected
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300 bg-white'
              }`}
            >
              {method.popular && (
                <span className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {t.popular}
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm md:text-base ${
                    isSelected ? 'text-gray-900' : 'text-gray-900'
                  }`}>
                    {method.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                </div>
                {isSelected && (
                  <FiCheck className="text-gray-900 text-xl flex-shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600 text-sm md:text-base">Total Amount:</span>
          <span className="text-xl md:text-2xl font-bold text-gray-900">
            ₹{amount.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handlePayment}
          disabled={!selectedMethod || processing}
          className="w-full btn-primary py-3 text-base md:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? t.processing : t.payNow}
        </button>

        <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
          <FiCheck className="text-green-500" />
          {t.securePayment}
        </p>
      </div>
    </div>
  )
}

