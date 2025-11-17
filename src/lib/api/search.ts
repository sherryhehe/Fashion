import apiClient from './client';
import { Product, Order, Customer } from '@/types';

export interface GlobalSearchResult {
  products: Product[];
  orders: Order[];
  customers: Customer[];
}

/**
 * Global search API - searches across products, orders, and customers
 */
export const searchApi = {
  /**
   * Search across all entities
   */
  global: async (query: string, limit: number = 5): Promise<GlobalSearchResult> => {
    const searchQuery = query.trim().toLowerCase();
    if (!searchQuery) {
      return { products: [], orders: [], customers: [] };
    }

    try {
      // Search products (has dedicated search endpoint)
      let products: Product[] = [];
      try {
        const productsRes = await apiClient.get<Product[]>('/products/search', { q: searchQuery, limit });
        products = productsRes.data || [];
      } catch (error) {
        console.error('Product search error:', error);
      }

      // Search orders and customers (client-side filtering from getAll)
      let orders: Order[] = [];
      let customers: Customer[] = [];
      
      try {
        const [ordersRes, customersRes] = await Promise.all([
          apiClient.get<any>('/orders', { limit: 50 }), // Get more to filter client-side
          apiClient.get<any>('/customers', { limit: 50 }),
        ]);

        const allOrders = ordersRes.data?.data || ordersRes.data || [];
        const allCustomers = customersRes.data?.data || customersRes.data || [];

        // Client-side filtering
        orders = allOrders.filter((order: Order) => {
          const orderNumber = (order.orderNumber || order._id || order.id || '').toString().toLowerCase();
          const status = (order.status || '').toString().toLowerCase();
          return orderNumber.includes(searchQuery) || status.includes(searchQuery);
        }).slice(0, limit);

        customers = allCustomers.filter((customer: Customer) => {
          const name = (customer.name || '').toString().toLowerCase();
          const email = (customer.email || '').toString().toLowerCase();
          return name.includes(searchQuery) || email.includes(searchQuery);
        }).slice(0, limit);
      } catch (error) {
        console.error('Orders/Customers search error:', error);
      }

      return {
        products,
        orders,
        customers,
      };
    } catch (error) {
      console.error('Global search error:', error);
      return { products: [], orders: [], customers: [] };
    }
  },
};
