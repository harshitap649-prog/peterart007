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
      isAdmin: doc.data().isAdmin || false
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

