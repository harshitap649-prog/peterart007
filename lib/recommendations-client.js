/**
 * Client-side functions for fetching recommendations
 */

export async function getPersonalizedRecommendations(userId, limit = 10) {
  try {
    const response = await fetch(`/api/recommendations?userId=${userId}&type=personalized&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error)
    return []
  }
}

export async function getTrendingArtworks(limit = 10) {
  try {
    const response = await fetch(`/api/recommendations?type=trending&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch trending artworks')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching trending artworks:', error)
    return []
  }
}

export async function getSimilarArtworks(artworkId, limit = 6) {
  try {
    const response = await fetch(`/api/recommendations?type=similar&artworkId=${artworkId}&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch similar artworks')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching similar artworks:', error)
    return []
  }
}

export async function getBecauseYouLiked(userId, limit = 6) {
  try {
    const response = await fetch(`/api/recommendations?userId=${userId}&type=becauseYouLiked&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch because you liked recommendations')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching because you liked:', error)
    return []
  }
}

