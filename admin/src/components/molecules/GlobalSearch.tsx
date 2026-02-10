'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchApi } from '@/lib/api';
import { Product, Order, Customer } from '@/types';
import { getProductImageUrl } from '@/utils/imageHelper';

interface GlobalSearchResult {
  products: Product[];
  orders: Order[];
  customers: Customer[];
}

interface GlobalSearchProps {
  className?: string;
}

export default function GlobalSearch({ className = '' }: GlobalSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult>({
    products: [],
    orders: [],
    customers: [],
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'products' | 'orders' | 'customers'>('all');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setResults({ products: [], orders: [], customers: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults({ products: [], orders: [], customers: [] });
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchApi.global(query, 5);
      setResults(searchResults);
      const hasResults = 
        searchResults.products.length > 0 || 
        searchResults.orders.length > 0 || 
        searchResults.customers.length > 0;
      setShowResults(hasResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults({ products: [], orders: [], customers: [] });
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to product list with search query
      router.push(`/product-list?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
      setSearchQuery('');
    }
  };

  const handleResultClick = (type: 'product' | 'order' | 'customer', id: string) => {
    if (type === 'product') {
      router.push(`/product-details?id=${id}`);
    } else if (type === 'order') {
      router.push(`/order-detail?id=${id}`);
    } else if (type === 'customer') {
      router.push(`/customer-detail?id=${id}`);
    }
    setShowResults(false);
    setSearchQuery('');
  };

  const totalResults = results.products.length + results.orders.length + results.customers.length;

  const filteredResults = {
    products: activeCategory === 'all' || activeCategory === 'products' ? results.products : [],
    orders: activeCategory === 'all' || activeCategory === 'orders' ? results.orders : [],
    customers: activeCategory === 'all' || activeCategory === 'customers' ? results.customers : [],
  };

  const displayResults = 
    filteredResults.products.length > 0 ||
    filteredResults.orders.length > 0 ||
    filteredResults.customers.length > 0;

  return (
    <div 
      className={`position-relative ${className}`} 
      ref={searchRef} 
      style={{ 
        width: '100%', 
        maxWidth: '100%',
      }}
    >
      <form onSubmit={handleSubmit} className="position-relative w-100">
        <input
          ref={inputRef}
          type="search"
          className="form-control w-100"
          placeholder="Search products, orders, customers..."
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim().length >= 2) {
              setShowResults(true);
            }
          }}
          onFocus={() => {
            if (searchQuery.trim().length >= 2 && totalResults > 0) {
              setShowResults(true);
            }
          }}
          style={{ 
            width: '100%',
            paddingRight: '45px',
          }}
        />
        <button
          type="submit"
          className="position-absolute top-50 end-0 translate-middle-y me-3 border-0 bg-transparent p-0"
          style={{ 
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <iconify-icon 
            icon="solar:magnifer-linear" 
            style={{ fontSize: '18px', color: '#8486a7' }}
          ></iconify-icon>
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchQuery.trim().length >= 2 && (
        <div 
          className="dropdown-menu show position-absolute w-100 mt-1"
          style={{
            display: 'block',
            maxHeight: '500px',
            overflowY: 'auto',
            zIndex: 1050,
            boxShadow: '0 5px 10px rgba(30, 32, 37, 0.12)',
            borderRadius: '8px',
            padding: 0,
            width: '100%',
            left: 0,
            right: 0,
          }}
        >
          {/* Category Tabs */}
          <div className="border-bottom p-2 d-flex gap-2" style={{ flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveCategory('all')}
            >
              All ({totalResults})
            </button>
            {results.products.length > 0 && (
              <button
                className={`btn btn-sm ${activeCategory === 'products' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveCategory('products')}
              >
                Products ({results.products.length})
              </button>
            )}
            {results.orders.length > 0 && (
              <button
                className={`btn btn-sm ${activeCategory === 'orders' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveCategory('orders')}
              >
                Orders ({results.orders.length})
              </button>
            )}
            {results.customers.length > 0 && (
              <button
                className={`btn btn-sm ${activeCategory === 'customers' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveCategory('customers')}
              >
                Customers ({results.customers.length})
              </button>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border spinner-border-sm text-primary"></div>
              <p className="text-muted mt-2 mb-0">Searching...</p>
            </div>
          ) : !displayResults ? (
            <div className="text-center p-4">
              <iconify-icon icon="solar:magnifer-linear" style={{ fontSize: '32px', color: '#ccc' }}></iconify-icon>
              <p className="text-muted mt-2 mb-0">No results found</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {/* Products */}
              {filteredResults.products.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-light fw-semibold">Products</div>
                  {filteredResults.products.map((product: Product) => (
                    <div
                      key={product._id || product.id}
                      className="dropdown-item d-flex align-items-center p-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleResultClick('product', product._id || product.id || '')}
                    >
                      <img
                        src={getProductImageUrl(product.images || [], 0, '/assets/images/products/product-1.png')}
                        alt={product.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        className="me-3"
                      />
                      <div className="flex-grow-1">
                        <div className="fw-medium">{product.name}</div>
                        <small className="text-muted">${product.price?.toFixed(2)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders */}
              {filteredResults.orders.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-light fw-semibold">Orders</div>
                  {filteredResults.orders.map((order: Order) => (
                    <div
                      key={order._id || order.id}
                      className="dropdown-item p-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleResultClick('order', order._id || order.id || '')}
                    >
                      <div className="fw-medium">Order #{order.orderNumber || order._id || order.id}</div>
                      <small className="text-muted">
                        {order.status} • ${order.total?.toFixed(2)}
                      </small>
                    </div>
                  ))}
                </div>
              )}

              {/* Customers */}
              {filteredResults.customers.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-light fw-semibold">Customers</div>
                  {filteredResults.customers.map((customer: Customer) => (
                    <div
                      key={customer._id || customer.id}
                      className="dropdown-item d-flex align-items-center p-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleResultClick('customer', customer._id || customer.id || '')}
                    >
                      <div className="me-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                          {(customer.name || customer.email || 'C')[0].toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-medium">{customer.name || customer.email}</div>
                        <small className="text-muted">{customer.email}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View All Results */}
              {totalResults > 5 && (
                <div className="border-top p-2 text-center">
                  <button
                    className="btn btn-sm btn-outline-primary w-100"
                    onClick={handleSubmit}
                  >
                    View All Results ({totalResults})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
