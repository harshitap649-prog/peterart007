// Support messages functions

export const getAllSupportMessages = async () => {
  try {
    const response = await fetch('/api/support');
    if (!response.ok) {
      throw new Error('Failed to fetch support messages');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching support messages:', error);
    throw error;
  }
};

export const createSupportMessage = async (messageData) => {
  try {
    const response = await fetch('/api/support', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create support message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating support message:', error);
    throw error;
  }
};

export const updateSupportMessage = async (id, updateData) => {
  try {
    const response = await fetch('/api/support', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, ...updateData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update support message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating support message:', error);
    throw error;
  }
};

export const deleteSupportMessage = async (id) => {
  try {
    const response = await fetch(`/api/support?id=${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete support message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting support message:', error);
    throw error;
  }
};

