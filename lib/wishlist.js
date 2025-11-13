// Local storage implementation for wishlist

export const addToWishlist = async (userId, artworkId) => {
  try {
    const response = await fetch('/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, artworkId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to wishlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (userId, artworkId) => {
  try {
    const response = await fetch(`/api/wishlist?userId=${userId}&artworkId=${artworkId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from wishlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const getUserWishlist = async (userId) => {
  try {
    const response = await fetch(`/api/wishlist?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch wishlist');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const isInWishlist = async (userId, artworkId) => {
  try {
    const response = await fetch('/api/wishlist', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, artworkId })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.exists || false;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

