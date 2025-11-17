'use client'

import { useState, useEffect } from 'react'
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiCalendar, FiMail, FiPhone } from 'react-icons/fi'

interface OrderTrackingProps {
  order: any
  language?: 'en' | 'hi'
}

export default function OrderTracking({ order, language = 'en' }: OrderTrackingProps) {
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(null)

  const translations = {
    en: {
      orderTracking: 'Order Tracking',
      orderId: 'Order ID',
      trackingNumber: 'Tracking Number',
      estimatedDelivery: 'Estimated Delivery',
      deliveryAddress: 'Delivery Address',
      orderStatus: 'Order Status',
      paymentStatus: 'Payment Status',
      timeline: 'Order Timeline',
      confirmed: 'Order Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      inTransit: 'In Transit',
      outForDelivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded',
      noTracking: 'Tracking number will be updated soon',
      trackOn: 'Track on',
      notifyMe: 'Notify Me',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      notificationsEnabled: 'Notifications enabled',
      notificationsDisabled: 'Notifications disabled'
    },
    hi: {
      orderTracking: 'ऑर्डर ट्रैकिंग',
      orderId: 'ऑर्डर आईडी',
      trackingNumber: 'ट्रैकिंग नंबर',
      estimatedDelivery: 'अनुमानित डिलीवरी',
      deliveryAddress: 'डिलीवरी पता',
      orderStatus: 'ऑर्डर स्थिति',
      paymentStatus: 'भुगतान स्थिति',
      timeline: 'ऑर्डर समयरेखा',
      confirmed: 'ऑर्डर पुष्टि',
      processing: 'प्रसंस्करण',
      shipped: 'शिप किया गया',
      inTransit: 'ट्रांजिट में',
      outForDelivery: 'डिलीवरी के लिए बाहर',
      delivered: 'डिलीवर',
      cancelled: 'रद्द',
      returned: 'वापस',
      pending: 'लंबित',
      paid: 'भुगतान किया',
      failed: 'विफल',
      refunded: 'वापस किया गया',
      noTracking: 'ट्रैकिंग नंबर जल्द ही अपडेट किया जाएगा',
      trackOn: 'ट्रैक करें',
      notifyMe: 'मुझे सूचित करें',
      emailNotifications: 'ईमेल सूचनाएं',
      smsNotifications: 'एसएमएस सूचनाएं',
      notificationsEnabled: 'सूचनाएं सक्षम',
      notificationsDisabled: 'सूचनाएं अक्षम'
    }
  }

  const t = translations[language]

  // Calculate estimated delivery date
  useEffect(() => {
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt)
      const estimatedDate = new Date(orderDate)
      
      // Add days based on status
      if (order.status === 'confirmed' || order.status === 'pending') {
        estimatedDate.setDate(estimatedDate.getDate() + 7) // 7 days for processing + shipping
      } else if (order.status === 'shipped' || order.status === 'in-transit') {
        estimatedDate.setDate(estimatedDate.getDate() + 3) // 3 days for delivery
      } else if (order.status === 'out-for-delivery') {
        estimatedDate.setDate(estimatedDate.getDate() + 1) // 1 day
      }
      
      setEstimatedDelivery(estimatedDate)
    }
  }, [order])

  const getStatusSteps = () => {
    const steps = [
      { key: 'confirmed', label: t.confirmed, icon: FiCheckCircle },
      { key: 'processing', label: t.processing, icon: FiPackage },
      { key: 'shipped', label: t.shipped, icon: FiTruck },
      { key: 'in-transit', label: t.inTransit, icon: FiTruck },
      { key: 'out-for-delivery', label: t.outForDelivery, icon: FiTruck },
      { key: 'delivered', label: t.delivered, icon: FiCheckCircle }
    ]

    const statusOrder = ['confirmed', 'processing', 'shipped', 'in-transit', 'out-for-delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(order.status) || 0

    return steps.map((step, index) => {
      const stepIndex = statusOrder.indexOf(step.key)
      const isCompleted = stepIndex <= currentIndex
      const isCurrent = stepIndex === currentIndex
      const Icon = step.icon

      return {
        ...step,
        isCompleted,
        isCurrent,
        Icon
      }
    })
  }

  const statusSteps = getStatusSteps()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500 text-white'
      case 'shipped':
      case 'in-transit':
      case 'out-for-delivery':
        return 'bg-blue-500 text-white'
      case 'processing':
        return 'bg-yellow-500 text-white'
      case 'confirmed':
        return 'bg-purple-500 text-white'
      case 'cancelled':
        return 'bg-red-500 text-white'
      case 'returned':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-500 text-white'
      case 'pending':
        return 'bg-yellow-500 text-white'
      case 'failed':
        return 'bg-red-500 text-white'
      case 'refunded':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Order Info Card */}
      <div className="card p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">{t.orderId}</p>
            <p className="font-bold text-gray-900 text-sm md:text-base">#{order.id.slice(0, 12)}</p>
          </div>
          {order.trackingNumber && (
            <div>
              <p className="text-xs text-gray-600 mb-1">{t.trackingNumber}</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 text-sm md:text-base">{order.trackingNumber}</p>
                {order.trackingProvider && (
                  <a
                    href={order.trackingUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    {t.trackOn} {order.trackingProvider}
                  </a>
                )}
              </div>
            </div>
          )}
          {!order.trackingNumber && (
            <div>
              <p className="text-xs text-gray-500 italic">{t.noTracking}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-600 mb-2">{t.orderStatus}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${getStatusColor(order.status)}`}>
            {t[order.status as keyof typeof t] || order.status}
          </span>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-600 mb-2">{t.paymentStatus}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus || 'pending')}`}>
            {t[order.paymentStatus as keyof typeof t] || order.paymentStatus || t.pending}
          </span>
        </div>
      </div>

      {/* Estimated Delivery */}
      {estimatedDelivery && (
        <div className="card p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <FiCalendar className="text-white text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-600">{t.estimatedDelivery}</p>
              <p className="font-bold text-gray-900 text-sm md:text-base">
                {estimatedDelivery.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Timeline */}
      <div className="card p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiClock className="text-orange-600" />
          {t.timeline}
        </h3>
        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const Icon = step.Icon
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${
                    step.isCompleted
                      ? 'bg-green-500 text-white'
                      : step.isCurrent
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="text-sm md:text-base" />
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`w-0.5 h-8 md:h-12 ${
                      step.isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-4 md:pb-6">
                  <p className={`font-semibold text-sm md:text-base ${
                    step.isCompleted || step.isCurrent
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.isCurrent && order.updatedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.updatedAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Delivery Address */}
      {order.address1 && (
        <div className="card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FiMapPin className="text-orange-600" />
            {t.deliveryAddress}
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-semibold">{order.fullName}</p>
            <p>{order.address1}</p>
            {order.address2 && <p>{order.address2}</p>}
            <p>
              {order.city}, {order.state} {order.pincode}
            </p>
            <p>{order.country}</p>
            {order.phone && (
              <p className="flex items-center gap-1 mt-2">
                <FiPhone className="text-xs" />
                {order.phone}
              </p>
            )}
            {order.email && (
              <p className="flex items-center gap-1">
                <FiMail className="text-xs" />
                {order.email}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="card p-4 md:p-6 bg-gradient-to-br from-orange-50 to-purple-50 border-2 border-orange-100">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">
          {t.notifyMe}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <FiMail className="text-orange-600" />
              <span className="text-sm font-medium text-gray-700">{t.emailNotifications}</span>
            </div>
            <span className="text-xs text-green-600 font-medium">{t.notificationsEnabled}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <FiPhone className="text-orange-600" />
              <span className="text-sm font-medium text-gray-700">{t.smsNotifications}</span>
            </div>
            <span className="text-xs text-green-600 font-medium">{t.notificationsEnabled}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

