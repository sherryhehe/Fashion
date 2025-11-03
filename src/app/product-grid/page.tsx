'use client';

import Layout from '@/components/layout/Layout';
import { getProductImageUrl } from '@/utils/imageHelper';
import { formatCurrency } from '@/utils/currencyHelper';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';

export default function ProductGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (sortBy) {
        params.sortBy = sortBy;
        params.order = 'desc';
      }

      const response = await productsApi.getAll(params);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout pageTitle="Product Grid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">Products {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}</h4>
              <Link href="/product-add" className="btn btn-primary">
                <i className="mdi mdi-plus me-1"></i>
                Add Product
              </Link>
            </div>

            <div className="card-body">
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="">Sort By</option>
                    <option value="price">Price</option>
                    <option value="createdAt">Newest</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-2">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-package-variant-closed" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No Products Found</h5>
                  <Link href="/product-add" className="btn btn-primary mt-2">
                    <i className="mdi mdi-plus me-1"></i>
                    Add Your First Product
                  </Link>
                </div>
              ) : (
                <div className="row">
                  {filteredProducts.map((product) => {
                    const placeholderImage = '/assets/images/products/product-1.png';
                    const imageUrl = getProductImageUrl(product.images, 0, placeholderImage);
                    
                    return (
                      <div key={product._id || product.id} className="col-md-6 col-xl-3">
                        <div 
                          className="card product-card" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => window.location.href = `/product-details?id=${product._id || product.id}`}
                        >
                          <div className="card-body">
                            <div className="product-img">
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="img-fluid rounded"
                                style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                                }}
                              />
                            </div>
                            <div className="mt-3">
                              <h5 className="font-16 mb-1">
                                <span className="text-dark">
                                  {product.name}
                                </span>
                              </h5>
                              <p className="text-muted fs-13">{product.category}</p>
                              <h4 className="text-dark mt-2">{formatCurrency(product.price)}</h4>
                              <div className="mt-3">
                                <span className={`badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'} me-2`}>
                                  {product.status}
                                </span>
                                <span className="text-muted fs-13">Stock: {product.stock}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
