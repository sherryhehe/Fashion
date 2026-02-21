'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/currencyHelper';

import { getApiUrl } from '@/utils/apiHelper';

export default function CustomerDetail() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('id');

  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevCustomerId, setPrevCustomerId] = useState<string | null>(null);
  const [nextCustomerId, setNextCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setError('Customer ID is required');
      setLoading(false);
      return;
    }
    let cancelled = false;
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const base = getApiUrl();
        const res = await fetch(`${base}/users/${customerId}`, { headers });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.message || data.error || 'Failed to load customer');
          return;
        }
        const user = data.data || data;
        if (!cancelled) setCustomer(user);

        const ordersRes = await fetch(`${base}/orders?userId=${customerId}&limit=20`, { headers });
        const ordersData = await ordersRes.json();
        const orderList = ordersData.data ?? ordersData ?? [];
        if (!cancelled) setOrders(Array.isArray(orderList) ? orderList : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load customer');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    fetch(`${getApiUrl()}/users?role=customer&limit=500`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list = data.data ?? data ?? [];
        const ids = list.map((u: any) => u._id || u.id).filter(Boolean);
        const idx = ids.indexOf(customerId);
        if (idx > 0) setPrevCustomerId(ids[idx - 1]);
        else setPrevCustomerId(null);
        if (idx >= 0 && idx < ids.length - 1) setNextCustomerId(ids[idx + 1]);
        else setNextCustomerId(null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [customerId]);

  if (loading && !customer) {
    return (
      <Layout pageTitle="Customer Detail">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2">Loading customer...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !customer) {
    return (
      <Layout pageTitle="Customer Detail">
        <div className="container-fluid">
          <div className="text-center py-5">
            <p className="text-danger">{error || 'Customer not found'}</p>
            <Link href="/customer-list" className="btn btn-primary mt-2">Back to Customers</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const joinDate = customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A';
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const lastOrderDate = orders.length > 0 && orders[0].createdAt
    ? new Date(orders[0].createdAt).toLocaleDateString()
    : null;
  const daysSinceLastOrder = lastOrderDate && orders[0].createdAt
    ? Math.floor((Date.now() - new Date(orders[0].createdAt).getTime()) / (24 * 60 * 60 * 1000))
    : null;

  return (
    <Layout pageTitle="Customer Detail">
      <div className="container-fluid">
        {/* Breadcrumb + Prev/Next */}
        <div className="row mb-3">
          <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/customer-list">Customers</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{customer.name}</li>
              </ol>
            </nav>
            <div className="d-flex gap-2">
              {prevCustomerId && (
                <Link href={`/customer-detail?id=${prevCustomerId}`} className="btn btn-sm btn-outline-primary">
                  <i className="mdi mdi-arrow-left me-1" /> Previous
                </Link>
              )}
              {nextCustomerId && (
                <Link href={`/customer-detail?id=${nextCustomerId}`} className="btn btn-sm btn-outline-primary">
                  Next <i className="mdi mdi-arrow-right ms-1" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Customer Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center">
                    <div className="avatar-lg me-3 rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: 56, height: 56, fontSize: 24 }}>
                      {(customer.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="card-title mb-1">{customer.name}</h4>
                      <p className="text-muted mb-0">{customer.email}</p>
                      <small className="text-muted">Customer since {joinDate}</small>
                    </div>
                  </div>
                  <span className={`badge ${(customer.status || '').toLowerCase() === 'active' ? 'bg-success' : 'bg-secondary'} fs-6`}>
                    {(customer.status || 'N/A')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header"><h5 className="card-title mb-0">Personal Information</h5></div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <p className="mb-0">{customer.name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <p className="mb-0">{customer.email}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Phone</label>
                    <p className="mb-0">{customer.phone || 'N/A'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Customer ID</label>
                    <p className="mb-0">{customer._id || customer.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header"><h5 className="card-title mb-0">Recent Orders</h5></div>
              <div className="card-body">
                {orders.length === 0 ? (
                  <p className="text-muted mb-0">No orders yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order: any) => (
                          <tr key={order._id || order.orderNumber}>
                            <td><Link href={`/order-detail?id=${order._id}`} className="text-primary">{order.orderNumber || order._id}</Link></td>
                            <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td><span className="badge bg-primary">{(order.items || []).length}</span></td>
                            <td>{formatCurrency(order.total || 0)}</td>
                            <td>
                              <span className={`badge ${order.status === 'delivered' ? 'bg-success' : order.status === 'processing' ? 'bg-info' : 'bg-warning'}`}>
                                {order.status || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <Link href={`/order-detail?id=${order._id}`} className="btn btn-sm btn-outline-primary"><i className="bx bx-show" /></Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header"><h5 className="card-title mb-0">Statistics</h5></div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6 border-end">
                    <h4 className="text-primary mb-1">{totalOrders}</h4>
                    <p className="text-muted mb-0 small">Total Orders</p>
                  </div>
                  <div className="col-6">
                    <h4 className="text-success mb-1">{formatCurrency(totalSpent)}</h4>
                    <p className="text-muted mb-0 small">Total Spent</p>
                  </div>
                </div>
                <hr />
                <div className="row text-center">
                  <div className="col-6 border-end">
                    <h4 className="text-info mb-1">{formatCurrency(avgOrder)}</h4>
                    <p className="text-muted mb-0 small">Avg Order</p>
                  </div>
                  <div className="col-6">
                    <h4 className="text-warning mb-1">{daysSinceLastOrder != null ? daysSinceLastOrder : '—'}</h4>
                    <p className="text-muted mb-0 small">Days Since Last Order</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Link href="/customer-list" className="btn btn-outline-secondary w-100">
                <i className="mdi mdi-arrow-left me-1" /> Back to Customers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
