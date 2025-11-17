/**
 * Gift Card Management Functions
 */

/**
 * Generate a unique gift card code
 */
function generateGiftCardCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluding confusing characters
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += '-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += '-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Get all gift cards for a user
 */
export async function getUserGiftCards(userId) {
  try {
    const response = await fetch(`/api/giftcards?userId=${userId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch gift cards')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching gift cards:', error)
    return []
  }
}

/**
 * Get gift card by code
 */
export async function getGiftCardByCode(code) {
  try {
    const response = await fetch(`/api/giftcards?code=${code}`)
    if (!response.ok) {
      throw new Error('Failed to fetch gift card')
    }
    const data = await response.json()
    return data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching gift card:', error)
    return null
  }
}

/**
 * Purchase a gift card
 */
export async function purchaseGiftCard(giftCardData) {
  try {
    const response = await fetch('/api/giftcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(giftCardData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to purchase gift card')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error purchasing gift card:', error)
    throw error
  }
}

/**
 * Redeem a gift card (apply to order)
 */
export async function redeemGiftCard(code, orderId, amount = null) {
  try {
    const response = await fetch('/api/giftcards/redeem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, orderId, amount })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to redeem gift card')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error redeeming gift card:', error)
    throw error
  }
}

/**
 * Validate gift card code
 */
export async function validateGiftCardCode(code) {
  try {
    const giftCard = await getGiftCardByCode(code)
    if (!giftCard) {
      return { valid: false, error: 'Gift card not found' }
    }
    
    if (giftCard.status !== 'active') {
      return { valid: false, error: 'Gift card is not active' }
    }
    
    if (giftCard.balance <= 0) {
      return { valid: false, error: 'Gift card has no balance' }
    }
    
    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      return { valid: false, error: 'Gift card has expired' }
    }
    
    return { valid: true, giftCard }
  } catch (error) {
    return { valid: false, error: error.message || 'Failed to validate gift card' }
  }
}

export { generateGiftCardCode }

