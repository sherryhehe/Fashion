'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { brandsApi, dashboardApi } from '@/lib/api';
import { formatCurrencyNoDecimals } from '@/utils/currencyHelper';

export default function BrandDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [topBrands, setTopBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, brandsRes] = await Promise.all([
          dashboardApi.getStats(),
          brandsApi.getTop(8),
        ]);
        setStats(statsRes.data);
        setTopBrands(brandsRes.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load brand analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <Layout pageTitle="Brand Dashboard">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title mb-0">Brand Analytics</h4>
              <Link href="/brand-list" className="btn btn-sm btn-outline-primary">Manage Brands</Link>
            </div>
            <div className="card-body">
              {loading && (
                <div className="text-center py-5 text-muted">Loading...</div>
              )}
              {!!error && !loading && (
                <div className="alert alert-danger" role="alert">{error}</div>
              )}

              {!loading && !error && (
                <>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <p className="text-muted mb-1">Total Products</p>
                          <h4 className="mb-0">{stats?.overview?.totalProducts || '0'}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <p className="text-muted mb-1">Total Orders</p>
                          <h4 className="mb-0">{stats?.overview?.totalOrders || '0'}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <p className="text-muted mb-1">Total Customers</p>
                          <h4 className="mb-0">{stats?.overview?.totalCustomers || '0'}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <p className="text-muted mb-1">Revenue</p>
                          <h4 className="mb-0">{stats?.overview?.totalRevenue ? formatCurrencyNoDecimals(stats.overview.totalRevenue) : 'PKR 0'}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h5 className="mb-3">Top Brands</h5>
                  <div className="row">
                    {topBrands.map((brand) => (
                      <div className="col-md-3 mb-3" key={brand._id}>
                        <div className="card h-100">
                          <div className="card-body text-center">
                            <img
                              src={brand.logo || '/assets/images/brands/default.png'}
                              alt={brand.name}
                              className="img-fluid mb-2"
                              style={{ maxHeight: 56, objectFit: 'contain' }}
                            />
                            <h6 className="mb-0">{brand.name}</h6>
                            {brand.totalSales !== undefined && (
                              <small className="text-muted d-block">Sales: {brand.totalSales}</small>
                            )}
                            {brand.rating !== undefined && (
                              <small className="text-warning d-block"><i className="mdi mdi-star"></i> {brand.rating}</small>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
