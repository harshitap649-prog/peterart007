import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase.config';

export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      name: doc.data().name,
      createdAt: doc.data().createdAt,
      isAdmin: doc.data().isAdmin || false,
      disabled: doc.data().disabled || false
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const disableUser = async (userId, disabled) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ disabled })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error disabling user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

