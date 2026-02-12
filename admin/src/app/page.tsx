'use client';

import { Layout } from '@/components';
import TimeFilter, { TimeFilterOption } from '@/components/molecules/TimeFilter';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrencyNoDecimals, formatCurrency } from '@/utils/currencyHelper';
import { getApiUrl } from '@/utils/apiHelper';

export default function Home() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('1Y');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setIsAuthenticated(true);
    fetchDashboardStats();
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${getApiUrl()}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeFilterChange = (filter: TimeFilterOption) => {
    setTimeFilter(filter);
    // You can fetch filtered data here based on time period
  };

  // Don't render anything while checking authentication
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Layout pageTitle="Dashboard">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard data from MongoDB...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Dashboard">
      {/* Stats Cards */}
      <div className="row">
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-6">
                  <h5 className="text-muted fw-normal mt-0 text-truncate" title="Revenue">
                    Revenue
                  </h5>
                  <h3 className="my-2 py-1">{formatCurrencyNoDecimals(stats?.overview?.totalRevenue || 0)}</h3>
                  <p className="mb-0 text-muted">
                    <span className="text-success me-2">
                      <i className="mdi mdi-arrow-up-bold"></i> {stats?.overview?.paidOrders || 0} paid
                    </span>
                  </p>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <div className="avatar-sm bg-primary-subtle rounded">
                      <i className="mdi mdi-currency-usd avatar-title fs-22 text-primary"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-6">
                  <h5 className="text-muted fw-normal mt-0 text-truncate" title="Orders">
                    Orders
                  </h5>
                  <h3 className="my-2 py-1">{stats?.overview?.totalOrders || 0}</h3>
                  <p className="mb-0 text-muted">
                    <span className="text-nowrap">Total orders</span>
                  </p>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <div className="avatar-sm bg-success-subtle rounded">
                      <i className="mdi mdi-shopping avatar-title fs-22 text-success"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-6">
                  <h5 className="text-muted fw-normal mt-0 text-truncate" title="Customers">
                    Customers
                  </h5>
                  <h3 className="my-2 py-1">{stats?.overview?.totalCustomers || 0}</h3>
                  <p className="mb-0 text-muted">
                    <span className="text-nowrap">Registered users</span>
                  </p>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <div className="avatar-sm bg-info-subtle rounded">
                      <i className="mdi mdi-account-multiple avatar-title fs-22 text-info"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-6">
                  <h5 className="text-muted fw-normal mt-0 text-truncate" title="Average Order Value">
                    AOV
                  </h5>
                  <h3 className="my-2 py-1">{formatCurrency(stats?.overview?.averageOrderValue || 0)}</h3>
                  <p className="mb-0 text-muted">
                    <span className="text-nowrap">Avg order value</span>
                  </p>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <div className="avatar-sm bg-warning-subtle rounded">
                      <i className="mdi mdi-chart-line avatar-title fs-22 text-warning"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="text-muted fw-normal mt-0 text-truncate" title="Products">
                Products
              </h5>
              <h3 className="my-2 py-1">{stats?.overview?.totalProducts || 0}</h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">Total products</span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="text-muted fw-normal mt-0 text-truncate" title="Pending Orders">
                Pending
              </h5>
              <h3 className="my-2 py-1">{stats?.orders?.pending || 0}</h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">Pending orders</span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="text-muted fw-normal mt-0 text-truncate" title="Processing Orders">
                Processing
              </h5>
              <h3 className="my-2 py-1">{stats?.orders?.processing || 0}</h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">In process</span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="text-muted fw-normal mt-0 text-truncate" title="Delivered Orders">
                Delivered
              </h5>
              <h3 className="my-2 py-1">{stats?.orders?.delivered || 0}</h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">Completed</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">Recent Orders</h4>
            </div>
            <div className="card-body">
              {stats?.recentOrders?.length === 0 ? (
                <div className="text-center py-4">
                  <i className="mdi mdi-package-variant-closed" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <p className="text-muted mt-2">No orders yet</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-centered mb-0">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentOrders?.map((order: any) => (
                        <tr key={order.id}>
                          <td>{order.orderNumber}</td>
                          <td>{order.customer}</td>
                          <td>{formatCurrency(order.total)}</td>
                          <td>
                            <span className={`badge bg-${
                              order.status === 'delivered' ? 'success' :
                              order.status === 'processing' ? 'primary' :
                              order.status === 'shipped' ? 'info' :
                              'warning'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Products */}
      {stats?.lowStockProducts?.length > 0 && (
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h4 className="header-title">Low Stock Alert</h4>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lowStockProducts.map((product: any) => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>{product.sku}</td>
                          <td>
                            <span className="badge bg-danger">{product.stock}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
