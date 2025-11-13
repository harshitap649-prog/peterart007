// Local storage implementation - no Firebase Storage needed

export const getAllArtworks = async () => {
  try {
    const response = await fetch('/api/artworks');
    if (!response.ok) {
      throw new Error('Failed to fetch artworks');
    }
    const artworks = await response.json();
    // Sort by createdAt descending
    return artworks.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } catch (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }
};

export const getArtworkById = async (id) => {
  try {
    const response = await fetch(`/api/artworks/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch artwork');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching artwork:', error);
    throw error;
  }
};

export const addArtwork = async (artworkData, images) => {
  try {
    const formData = new FormData();
    formData.append('title', artworkData.title);
    formData.append('description', artworkData.description);
    formData.append('price', artworkData.price.toString());
    formData.append('category', artworkData.category || '');
    
    // Append all images
    for (const image of images) {
      formData.append('images', image);
    }
    
    const response = await fetch('/api/artworks', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add artwork');
    }
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error adding artwork:', error);
    throw error;
  }
};

export const updateArtwork = async (id, artworkData, newImages = []) => {
  try {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('title', artworkData.title);
    formData.append('description', artworkData.description);
    formData.append('price', artworkData.price.toString());
    formData.append('category', artworkData.category || '');
    
    // Append new images if provided
    for (const image of newImages) {
      formData.append('images', image);
    }
    
    const response = await fetch('/api/artworks', {
      method: 'PUT',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update artwork');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating artwork:', error);
    throw error;
  }
};

export const deleteArtwork = async (id) => {
  try {
    const response = await fetch(`/api/artworks?id=${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete artwork');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting artwork:', error);
    throw error;
  }
};

export const searchArtworks = async (searchTerm) => {
  try {
    const artworks = await getAllArtworks();
    const term = searchTerm.toLowerCase();
    return artworks.filter(artwork => 
      artwork.title?.toLowerCase().includes(term) ||
      artwork.description?.toLowerCase().includes(term) ||
      artwork.category?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching artworks:', error);
    throw error;
  }
};

