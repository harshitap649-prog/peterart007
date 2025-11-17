/**
 * Follow Artists Management Functions
 */

/**
 * Check if user follows an artist
 */
export async function isFollowingArtist(userId, artistId) {
  try {
    const response = await fetch(`/api/follows?userId=${userId}&artistId=${artistId}&type=check`)
    if (!response.ok) {
      return false
    }
    const data = await response.json()
    return data.isFollowing || false
  } catch (error) {
    console.error('Error checking follow status:', error)
    return false
  }
}

/**
 * Follow an artist
 */
export async function followArtist(userId, artistId) {
  try {
    const response = await fetch('/api/follows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, artistId })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to follow artist')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error following artist:', error)
    throw error
  }
}

/**
 * Unfollow an artist
 */
export async function unfollowArtist(userId, artistId) {
  try {
    const response = await fetch(`/api/follows?userId=${userId}&artistId=${artistId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to unfollow artist')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error unfollowing artist:', error)
    throw error
  }
}

/**
 * Get all artists a user follows
 */
export async function getUserFollowing(userId) {
  try {
    const response = await fetch(`/api/follows?userId=${userId}&type=following`)
    if (!response.ok) {
      return []
    }
    return await response.json()
  } catch (error) {
    console.error('Error getting user following:', error)
    return []
  }
}

/**
 * Get all followers of an artist
 */
export async function getArtistFollowers(artistId) {
  try {
    const response = await fetch(`/api/follows?artistId=${artistId}&type=followers`)
    if (!response.ok) {
      return []
    }
    return await response.json()
  } catch (error) {
    console.error('Error getting artist followers:', error)
    return []
  }
}

