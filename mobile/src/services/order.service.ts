import apiClient from './api.service';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  size?: string;
  color?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: ShippingAddress;
  notes?: string;
  timeline: Array<{
    status: string;
    date: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  data?: Order | Order[];
  message?: string;
}

const orderService = {
  /**
   * Get all orders for the authenticated user
   */
  getOrders: async (): Promise<OrderResponse> => {
    return apiClient.get('/orders');
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    return apiClient.get(`/orders/${orderId}`);
  },

  /**
   * Create a new order
   */
  createOrder: async (data: CreateOrderData): Promise<OrderResponse> => {
    return apiClient.post('/orders', data);
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string): Promise<OrderResponse> => {
    return apiClient.put(`/orders/${orderId}/cancel`);
  },
};

export default orderService;

