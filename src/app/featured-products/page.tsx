'use client';

import { Layout, InteractiveTable, InteractiveButton } from '@/components';
import { useNotificationContext } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { getProductImageUrl } from '@/utils/imageHelper';
import { formatCurrency } from '@/utils/currencyHelper';

export default function FeaturedProducts() {
  const { addNotification } = useNotificationContext();
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured products from MongoDB backend
  useEffect(() => {
    fetchFeaturedProducts();
  }, [statusFilter, categoryFilter]);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const params: any = { featured: true };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const response = await productsApi.getAll(params);
      setProducts(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch featured products:', error);
      addNotification('error', error?.message || 'Failed to load featured products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsApi.delete(id);
      addNotification('success', 'Product deleted successfully');
      fetchFeaturedProducts(); // Refresh list
    } catch (error: any) {
      addNotification('error', error?.message || 'Failed to delete product');
    }
  };

  const columns = [
    {
      key: 'images',
      label: 'Image',
      render: (value: string[], row: any) => {
        const placeholderImage = '/assets/images/products/product-1.png';
        const imageUrl = getProductImageUrl(value, 0, placeholderImage);
        
        return (
          <img 
            src={imageUrl} 
            alt={row.name} 
            className="rounded" 
            style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }} 
            onClick={() => window.location.href = `/product-details?id=${row._id || row.id}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderImage;
            }}
          />
        );
      }
    },
    { 
      key: 'name', 
      label: 'Product Name',
      render: (value: string, row: any) => (
        <a 
          href={`/product-details?id=${row._id || row.id}`}
          className="text-dark fw-medium text-decoration-none"
          style={{ cursor: 'pointer' }}
        >
          {value}
        </a>
      )
    },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (value: number) => (
        <span className={`badge ${value > 20 ? 'bg-success' : value > 0 ? 'bg-warning' : 'bg-danger'}`}>
          {value || 0}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`badge ${value === 'active' ? 'bg-success' : 'bg-secondary'}`}>
          {value || 'inactive'}
        </span>
      )
    }
  ];

  const handleEdit = (product: any) => {
    window.location.href = `/product-edit?id=${product._id || product.id}`;
  };

  const handleDeleteAction = async (product: any) => {
    await handleDelete(product._id || product.id);
  };

  return (
    <Layout pageTitle="Featured Products">
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">Featured Products {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}</h4>
              <Link href="/product-list">
                <InteractiveButton variant="outline-primary">
                  <i className="mdi mdi-arrow-left me-1"></i>
                  View All Products
                </InteractiveButton>
              </Link>
            </div>

            <div className="card-body">
              {/* Filters */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <select 
                    className="form-select" 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filter by category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Featured Products Table */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading featured products from MongoDB...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-star-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No Featured Products Yet</h5>
                  <p className="text-muted">Mark products as featured to display them here.</p>
                  <Link href="/product-list">
                    <InteractiveButton variant="primary">
                      <i className="mdi mdi-package-variant me-1"></i>
                      View All Products
                    </InteractiveButton>
                  </Link>
                </div>
              ) : (
                <InteractiveTable
                  data={products}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDeleteAction}
                  itemsPerPage={10}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
