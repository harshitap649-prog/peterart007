// Payment gateway utilities

// Initialize Razorpay (client-side only)
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay can only be loaded on client side'))
      return
    }

    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      resolve(window.Razorpay)
    }
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay script'))
    }
    document.body.appendChild(script)
  })
}

// Create Razorpay order
export const createRazorpayOrder = async (amount, orderId, userDetails) => {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        orderId,
        userDetails
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create payment order')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

// Verify payment
export const verifyPayment = async (paymentId, orderId, signature) => {
  try {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentId,
        orderId,
        signature
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Payment verification failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Error verifying payment:', error)
    throw error
  }
}

// Process payment with Razorpay
export const processPayment = async (amount, orderId, userDetails, options = {}) => {
  try {
    const Razorpay = await loadRazorpayScript()
    
    // Create order on server
    const razorpayOrder = await createRazorpayOrder(amount, orderId, userDetails)

    return new Promise((resolve, reject) => {
      const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Test key - replace with your key
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'Peter Art',
        description: `Order #${orderId}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verification = await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            )
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              verification
            })
          } catch (error) {
            reject(error)
          }
        },
        prefill: {
          name: userDetails.name || '',
          email: userDetails.email || '',
          contact: userDetails.phone || ''
        },
        theme: {
          color: '#f97316'
        },
        modal: {
          ondismiss: function() {
            reject(new Error('Payment cancelled by user'))
          }
        },
        ...options
      }

      const razorpay = new Razorpay(razorpayOptions)
      razorpay.open()
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    throw error
  }
}

// Get payment status
export const getPaymentStatus = async (orderId) => {
  try {
    const response = await fetch(`/api/payment/status?orderId=${orderId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch payment status')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching payment status:', error)
    throw error
  }
}

// Request refund
export const requestRefund = async (orderId, amount, reason) => {
  try {
    const response = await fetch('/api/payment/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId,
        amount,
        reason
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Refund request failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Error requesting refund:', error)
    throw error
  }
}

