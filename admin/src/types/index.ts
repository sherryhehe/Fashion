// Core Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  avatar?: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastLogin: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  style?: string;
  brand?: string;
  sku: string;
  inventory: number;
  minStock: number;
  weight?: number;
  dimensions?: string;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  status: 'active' | 'inactive' | 'draft';
  visibility: 'visible' | 'hidden';
  featured: boolean;
  rating: number;
  reviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer: User;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping: ShippingInfo;
  payment: PaymentInfo;
  totals: OrderTotals;
  notes?: string;
  timeline: OrderEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingInfo {
  method: string;
  cost: number;
  tracking?: string;
  address: Address;
}

export interface PaymentInfo {
  method: string;
  status: string;
  transactionId: string;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface OrderEvent {
  status: string;
  date: string;
  description: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Customer extends User {
  totalOrders: number;
  totalSpent: number;
  averageOrder: number;
  lastOrderDate: string;
  preferences: {
    newsletter: boolean;
    sms: boolean;
    email: boolean;
  };
  tags: string[];
  notes: CustomerNote[];
}

export interface CustomerNote {
  id: number;
  date: string;
  author: string;
  note: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Style {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  status: 'active' | 'inactive';
  featured: boolean;
  popular: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}


export interface Seller extends User {
  businessName: string;
  businessType: string;
  totalProducts: number;
  totalSales: number;
  rating: number;
  status: 'active' | 'pending' | 'suspended';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  documents: string[];
}

// Component Props Types
export interface LayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export interface SidebarProps {
  isCollapsed?: boolean;
  className?: string;
}

export interface HeaderProps {
  pageTitle: string;
}

// Menu Types
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  children?: SubMenuItem[];
  isTitle?: boolean;
}

export interface SubMenuItem {
  id: string;
  label: string;
  href: string;
}

// Form Types
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  style?: string;
  brand?: string;
  sku: string;
  inventory: number;
  minStock?: number;
  weight?: number;
  dimensions?: string;
  features: string[];
  specifications: Record<string, string>;
  status: 'active' | 'inactive' | 'draft';
  visibility: 'visible' | 'hidden';
  featured: boolean;
}

export interface OrderFormData {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingMethod: string;
  paymentMethod: string;
  notes?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

// Dashboard Types
export interface DashboardStats {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    averageOrderValue: number;
    paidOrders: number;
  };
  orders: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    total: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    createdAt: Date;
  }>;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    stock: number;
    sku: string;
  }>;
  categories: number;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
