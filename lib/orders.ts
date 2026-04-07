// Local storage implementation for orders

export interface OrderData {
  userId: string;
  userEmail: string;
  userName: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  couponCode?: string | null;
  couponDiscount?: number;
  bulkDiscount?: number;
  isGift?: boolean;
  giftMessage?: string | null;
  scheduledDeliveryDate?: string | null;
  fullName?: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
}

export const createOrder = async (orderData: OrderData): Promise<string> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<any[]> => {
  try {
    const response = await fetch(`/api/orders?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user orders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<any[]> => {
  try {
    const response = await fetch('/api/orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<any> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: orderId, status })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update order status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getOrdersByStatus = async (status: string): Promise<any[]> => {
  try {
    const orders = await getAllOrders();
    return orders.filter((order: any) => order.status === status);
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/orders?id=${orderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string, hardDelete = false): Promise<any> => {
  try {
    const url = hardDelete 
      ? `/api/orders?id=${orderId}&permanent=true&hard=true`
      : `/api/orders?id=${orderId}&permanent=true`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const returnOrder = async (orderId: string): Promise<any> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: orderId, status: 'returned' })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to return order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error returning order:', error);
    throw error;
  }
};
