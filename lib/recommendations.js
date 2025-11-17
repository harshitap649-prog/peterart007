/**
 * AI-Powered Recommendation System
 * Uses collaborative filtering and content-based filtering
 */

/**
 * Calculate similarity score between two artworks based on:
 * - Category
 * - Price range
 * - Description keywords
 */
function calculateSimilarity(artwork1, artwork2) {
  let score = 0
  
  // Category match (40% weight)
  if (artwork1.category && artwork2.category) {
    if (artwork1.category.toLowerCase() === artwork2.category.toLowerCase()) {
      score += 0.4
    }
  }
  
  // Price range similarity (20% weight)
  const priceDiff = Math.abs(artwork1.price - artwork2.price)
  const maxPrice = Math.max(artwork1.price, artwork2.price)
  if (maxPrice > 0) {
    const priceSimilarity = 1 - (priceDiff / maxPrice)
    score += priceSimilarity * 0.2
  }
  
  // Description keyword overlap (40% weight)
  if (artwork1.description && artwork2.description) {
    const words1 = artwork1.description.toLowerCase().split(/\s+/)
    const words2 = artwork2.description.toLowerCase().split(/\s+/)
    const commonWords = words1.filter(word => words2.includes(word) && word.length > 3)
    const totalUniqueWords = new Set([...words1, ...words2]).size
    if (totalUniqueWords > 0) {
      score += (commonWords.length / totalUniqueWords) * 0.4
    }
  }
  
  return Math.min(score, 1) // Cap at 1.0
}

/**
 * Get user preferences based on their activity
 */
function getUserPreferences(userId, artworks, wishlist, orders, views) {
  const preferences = {
    categories: {},
    priceRange: { min: Infinity, max: 0 },
    keywords: {},
    likedArtworks: []
  }
  
  // Analyze wishlist
  wishlist.forEach(item => {
    const artwork = artworks.find(a => a.id === item.artworkId)
    if (artwork) {
      preferences.likedArtworks.push(artwork.id)
      if (artwork.category) {
        preferences.categories[artwork.category] = (preferences.categories[artwork.category] || 0) + 2
      }
      preferences.priceRange.min = Math.min(preferences.priceRange.min, artwork.price)
      preferences.priceRange.max = Math.max(preferences.priceRange.max, artwork.price)
    }
  })
  
  // Analyze orders
  orders.forEach(order => {
    const artwork = artworks.find(a => a.id === order.artworkId)
    if (artwork) {
      preferences.likedArtworks.push(artwork.id)
      if (artwork.category) {
        preferences.categories[artwork.category] = (preferences.categories[artwork.category] || 0) + 3
      }
      preferences.priceRange.min = Math.min(preferences.priceRange.min, artwork.price)
      preferences.priceRange.max = Math.max(preferences.priceRange.max, artwork.price)
    }
  })
  
  // Analyze views
  views.forEach(view => {
    const artwork = artworks.find(a => a.id === view.artworkId)
    if (artwork) {
      if (artwork.category) {
        preferences.categories[artwork.category] = (preferences.categories[artwork.category] || 0) + 1
      }
    }
  })
  
  return preferences
}

/**
 * Get personalized recommendations for a user
 */
export function getPersonalizedRecommendations(userId, artworks, wishlist = [], orders = [], views = [], limit = 10) {
  if (!userId || artworks.length === 0) {
    return getTrendingArtworks(artworks, limit)
  }
  
  const preferences = getUserPreferences(userId, artworks, wishlist, orders, views)
  const userArtworkIds = new Set([...preferences.likedArtworks])
  
  // Score each artwork
  const scoredArtworks = artworks
    .filter(artwork => !userArtworkIds.has(artwork.id)) // Exclude already liked/ordered
    .map(artwork => {
      let score = 0
      
      // Category preference (40% weight)
      if (artwork.category && preferences.categories[artwork.category]) {
        const categoryWeight = preferences.categories[artwork.category]
        const maxCategoryWeight = Math.max(...Object.values(preferences.categories), 1)
        score += (categoryWeight / maxCategoryWeight) * 0.4
      }
      
      // Price range preference (20% weight)
      if (preferences.priceRange.min !== Infinity && preferences.priceRange.max !== 0) {
        const avgPrice = (preferences.priceRange.min + preferences.priceRange.max) / 2
        const priceDiff = Math.abs(artwork.price - avgPrice)
        const priceRange = preferences.priceRange.max - preferences.priceRange.min || 1
        const priceScore = 1 - Math.min(priceDiff / priceRange, 1)
        score += priceScore * 0.2
      }
      
      // Similarity to liked artworks (30% weight)
      if (preferences.likedArtworks.length > 0) {
        const similarities = preferences.likedArtworks
          .map(id => {
            const likedArtwork = artworks.find(a => a.id === id)
            return likedArtwork ? calculateSimilarity(artwork, likedArtwork) : 0
          })
        const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length
        score += avgSimilarity * 0.3
      }
      
      // Popularity boost (10% weight)
      const views = artwork.views || 0
      const comments = artwork.comments?.length || 0
      const likes = artwork.likes || 0
      const popularityScore = Math.min((views * 0.1 + comments * 2 + likes * 3) / 100, 1)
      score += popularityScore * 0.1
      
      return { artwork, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.artwork)
  
  return scoredArtworks
}

/**
 * Get trending artworks based on views, likes, and recent activity
 */
export function getTrendingArtworks(artworks, limit = 10) {
  return artworks
    .map(artwork => {
      const views = artwork.views || 0
      const comments = artwork.comments?.length || 0
      const likes = artwork.likes || 0
      
      // Calculate trending score
      const daysSinceCreation = (Date.now() - new Date(artwork.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
      const recencyBoost = Math.max(0, 1 - (daysSinceCreation / 30)) // Boost for items less than 30 days old
      
      const trendingScore = (views * 0.1 + comments * 2 + likes * 3) * (1 + recencyBoost)
      
      return { artwork, score: trendingScore }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.artwork)
}

/**
 * Get similar artworks to a given artwork
 */
export function getSimilarArtworks(artworkId, artworks, limit = 6) {
  const targetArtwork = artworks.find(a => a.id === artworkId)
  if (!targetArtwork) return []
  
  return artworks
    .filter(a => a.id !== artworkId)
    .map(artwork => ({
      artwork,
      similarity: calculateSimilarity(targetArtwork, artwork)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.artwork)
}

/**
 * Get "Because you liked..." recommendations
 */
export function getBecauseYouLiked(userId, artworks, wishlist = [], orders = [], limit = 6) {
  if (!userId) return []
  
  const userArtworkIds = new Set([
    ...wishlist.map(item => item.artworkId),
    ...orders.map(order => order.artworkId)
  ])
  
  if (userArtworkIds.size === 0) return []
  
  // Get the most recent liked/ordered artwork
  const recentArtworkId = [...userArtworkIds][userArtworkIds.size - 1]
  const recentArtwork = artworks.find(a => a.id === recentArtworkId)
  
  if (!recentArtwork) return []
  
  return getSimilarArtworks(recentArtworkId, artworks, limit)
}

