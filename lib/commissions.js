/**
 * Commission Management Functions
 */

/**
 * Get all commissions for an artist
 */
export async function getArtistCommissions(artistId) {
  try {
    const response = await fetch(`/api/commissions?artistId=${artistId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch commissions')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return []
  }
}

/**
 * Get pending commissions for an artist
 */
export async function getPendingCommissions(artistId) {
  try {
    const response = await fetch(`/api/commissions?artistId=${artistId}&status=pending`)
    if (!response.ok) {
      throw new Error('Failed to fetch pending commissions')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching pending commissions:', error)
    return []
  }
}

/**
 * Get all commissions (admin only)
 */
export async function getAllCommissions() {
  try {
    const response = await fetch('/api/commissions')
    if (!response.ok) {
      throw new Error('Failed to fetch commissions')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return []
  }
}

/**
 * Request payout for pending commissions
 */
export async function requestPayout(artistId, commissionIds) {
  try {
    const response = await fetch('/api/commissions/payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ artistId, commissionIds })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to request payout')
    }
    return await response.json()
  } catch (error) {
    console.error('Error requesting payout:', error)
    throw error
  }
}

