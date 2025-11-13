// Local storage implementation for comments and likes

export const addComment = async (artworkId, comment) => {
  try {
    const response = await fetch('/api/artworks/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ artworkId, comment })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add comment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const likeArtwork = async (artworkId, userId) => {
  try {
    const response = await fetch('/api/artworks/comments', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ artworkId, userId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to like artwork');
    }
    
    const result = await response.json();
    return result.liked;
  } catch (error) {
    console.error('Error liking artwork:', error);
    throw error;
  }
};

export const isLiked = async (artworkId, userId) => {
  try {
    const artwork = await fetch(`/api/artworks/${artworkId}`).then(r => r.json());
    const likedBy = artwork.likedBy || [];
    return likedBy.includes(userId);
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

