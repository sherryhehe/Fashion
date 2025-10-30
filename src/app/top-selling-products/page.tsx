'use client';

import Layout from '@/components/layout/Layout';
import { useEffect, useState } from 'react';
import { productsApi, dashboardApi } from '@/lib/api';

export default function TopSellingProducts() {
  const [stats, setStats] = useState<any>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, featuredRes] = await Promise.all([
          dashboardApi.getStats(),
          productsApi.getFeatured(),
        ]);
        setStats(statsRes.data);
        setFeaturedProducts(featuredRes.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout pageTitle="Top Selling Products">
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-success rounded">
                      <i className="bx bx-trophy avatar-title text-success fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Total Products</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">{stats?.overview?.totalProducts || '0'}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-primary rounded">
                      <i className="bx bx-star avatar-title text-primary fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Total Orders</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">{stats?.overview?.totalOrders || '0'}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-info rounded">
                      <i className="bx bx-trending-up avatar-title text-info fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Revenue</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">{stats?.overview?.totalRevenue || '$0.00'}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-warning rounded">
                      <i className="bx bx-target-lock avatar-title text-warning fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Customers</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">{stats?.overview?.totalCustomers || '0'}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title">Featured Products</h4>
                </div>
                {loading && <div className="text-muted">Loading...</div>}
                {!!error && !loading && <div className="alert alert-danger">{error}</div>}
                {!loading && !error && (
                  <div className="row">
                    {featuredProducts.map((product) => (
                      <div key={product._id} className="col-md-3 mb-3">
                        <div className="card border h-100">
                          <img src={product.images?.[0] || '/assets/images/products/product-1(1).png'} className="card-img-top" alt="Product" />
                          <div className="card-body">
                            <h6 className="card-title">{product.name}</h6>
                            <p className="card-text text-muted">{product.description}</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-success fw-bold">${product.price?.toFixed?.(2) ?? product.price}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
