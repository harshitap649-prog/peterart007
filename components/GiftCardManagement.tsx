'use client'

import { useState, useEffect } from 'react'
import { getUserGiftCards } from '@/lib/giftcards'
import { FiGift, FiCalendar, FiDollarSign, FiCheckCircle, FiXCircle, FiCopy, FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'
import GiftCardPurchase from './GiftCardPurchase'

interface GiftCardManagementProps {
  userId: string
  language?: 'en' | 'hi'
}

export default function GiftCardManagement({ userId, language = 'en' }: GiftCardManagementProps) {
  const [giftCards, setGiftCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPurchase, setShowPurchase] = useState(false)
  const [user, setUser] = useState<any>(null)

  const translations = {
    en: {
      title: 'My Gift Cards',
      subtitle: 'View and manage your gift cards',
      code: 'Code',
      balance: 'Balance',
      amount: 'Amount',
      status: 'Status',
      purchased: 'Purchased',
      expires: 'Expires',
      active: 'Active',
      used: 'Used',
      expired: 'Expired',
      noGiftCards: 'No gift cards found',
      copyCode: 'Copy code',
      codeCopied: 'Code copied!',
      recipient: 'Recipient',
      message: 'Message'
    },
    hi: {
      title: 'मेरे गिफ्ट कार्ड',
      subtitle: 'अपने गिफ्ट कार्ड देखें और प्रबंधित करें',
      code: 'कोड',
      balance: 'शेष',
      amount: 'राशि',
      status: 'स्थिति',
      purchased: 'खरीदा गया',
      expires: 'समाप्त होता है',
      active: 'सक्रिय',
      used: 'उपयोग किया गया',
      expired: 'समाप्त',
      noGiftCards: 'कोई गिफ्ट कार्ड नहीं मिला',
      copyCode: 'कोड कॉपी करें',
      codeCopied: 'कोड कॉपी किया गया!',
      recipient: 'प्राप्तकर्ता',
      message: 'संदेश'
    }
  }

  const t = translations[language]

  useEffect(() => {
    loadGiftCards()
    // Get current user
    import('@/lib/auth').then(({ getCurrentUser }) => {
      getCurrentUser().then(setUser)
    })
  }, [userId])

  const loadGiftCards = async () => {
    setLoading(true)
    try {
      const cards = await getUserGiftCards(userId)
      setGiftCards(cards)
    } catch (error) {
      console.error('Error loading gift cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t.codeCopied)
  }

  const getStatusBadge = (status: string, expiresAt: string) => {
    if (status === 'used') {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{t.used}</span>
    }
    if (status === 'inactive') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{t.expired}</span>
    }
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{t.expired}</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{t.active}</span>
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="card p-6 md:p-8 mb-6 bg-gradient-to-br from-orange-50 to-purple-50 border-2 border-orange-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-purple-500 rounded-lg">
            <FiGift className="text-2xl text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{t.title}</h2>
            <p className="text-xs md:text-sm text-gray-600">{t.subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{giftCards.length}</div>
            <div className="text-xs text-gray-500">{language === 'hi' ? 'कुल कार्ड' : 'Total Cards'}</div>
          </div>
        </div>
        {user && (
          <button
            onClick={() => setShowPurchase(!showPurchase)}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            <FiPlus className="text-base" />
            {language === 'hi' ? 'नया गिफ्ट कार्ड खरीदें' : 'Purchase New Gift Card'}
          </button>
        )}
      </div>

      {/* Gift Card Purchase Form */}
      {showPurchase && user && (
        <div className="mb-6">
          <GiftCardPurchase
            user={user}
            language={language}
            onSuccess={(giftCard) => {
              setShowPurchase(false)
              loadGiftCards()
            }}
          />
        </div>
      )}

      {giftCards.length === 0 ? (
        <div className="card p-6 md:p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-500 rounded-full mb-4">
            <FiGift className="text-4xl text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t.noGiftCards}</h3>
          <p className="text-sm text-gray-600">{language === 'hi' ? 'आपके पास अभी तक कोई गिफ्ट कार्ड नहीं है' : 'You don\'t have any gift cards yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {giftCards.map((card) => (
            <div
              key={card.id}
              className="card p-5 hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg font-mono tracking-wider">
                      {card.code}
                    </h3>
                    <button
                      onClick={() => copyToClipboard(card.code)}
                      className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                      title={t.copyCode}
                    >
                      <FiCopy className="text-sm" />
                    </button>
                  </div>
                  {getStatusBadge(card.status, card.expiresAt)}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <FiDollarSign className="text-base" />
                    {t.balance}:
                  </span>
                  <span className="font-bold text-lg text-orange-600">₹{card.balance.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.amount}:</span>
                  <span className="font-semibold text-orange-600">₹{card.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <FiCalendar className="text-xs" />
                    {t.expires}:
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(card.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {card.recipientName && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{t.recipient}:</p>
                  <p className="text-sm font-semibold text-gray-900">{card.recipientName}</p>
                  {card.message && (
                    <p className="text-xs text-gray-600 mt-2 italic">"{card.message}"</p>
                  )}
                </div>
              )}

              {card.transactions && card.transactions.length > 0 && (
                <div className="pt-3 border-t border-gray-100 mt-3">
                  <p className="text-xs text-gray-500 mb-2">{language === 'hi' ? 'लेन-देन' : 'Transactions'}:</p>
                  <div className="space-y-1">
                    {card.transactions.slice(-3).map((tx: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {tx.type === 'redeemed' ? (language === 'hi' ? 'उपयोग किया गया' : 'Redeemed') : tx.type}
                        </span>
                        <span className="font-semibold text-orange-600">-₹{tx.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

