/**
 * Artist Management Functions
 */

/**
 * Get all artists
 */
export async function getAllArtists() {
  try {
    const response = await fetch('/api/artists')
    if (!response.ok) {
      throw new Error('Failed to fetch artists')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching artists:', error)
    return []
  }
}

/**
 * Get artist by ID
 */
export async function getArtistById(artistId) {
  try {
    const response = await fetch(`/api/artists/${artistId}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch artist')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching artist:', error)
    return null
  }
}

/**
 * Get artist by user ID
 */
export async function getArtistByUserId(userId) {
  try {
    const response = await fetch(`/api/artists?userId=${userId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch artist')
    }
    const data = await response.json()
    return data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching artist:', error)
    return null
  }
}

/**
 * Register as artist
 */
export async function registerAsArtist(artistData) {
  try {
    const response = await fetch('/api/artists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(artistData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to register as artist')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error registering artist:', error)
    throw error
  }
}

/**
 * Update artist profile
 */
export async function updateArtistProfile(artistId, updates) {
  try {
    const response = await fetch(`/api/artists/${artistId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update artist profile')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating artist profile:', error)
    throw error
  }
}

/**
 * Delete artist and all their artworks
 */
export async function deleteArtist(artistId) {
  try {
    const response = await fetch(`/api/artists/${artistId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete artist')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting artist:', error)
    throw error
  }
}

/**
 * Get artist's artworks
 */
export async function getArtistArtworks(artistId) {
  try {
    const response = await fetch(`/api/artists/${artistId}/artworks`)
    if (!response.ok) {
      throw new Error('Failed to fetch artist artworks')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching artist artworks:', error)
    return []
  }
}

/**
 * Get artist sales statistics
 */
export async function getArtistSales(artistId) {
  try {
    const response = await fetch(`/api/artists/${artistId}/sales`)
    if (!response.ok) {
      throw new Error('Failed to fetch artist sales')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching artist sales:', error)
    return null
  }
}

