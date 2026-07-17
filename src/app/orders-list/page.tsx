'use client';

import { Layout, InteractiveTable, InteractiveButton } from '@/components';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api';
import { formatCurrency } from '@/utils/currencyHelper';

export default function OrdersList() {
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const response = await ordersApi.getAll(params);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (value: string, row: any) => (
        <a
          href={`/order-detail?id=${row._id || row.id}`}
          className="fw-medium text-decoration-none"
        >
          {value}
        </a>
      )
    },
    {
      key: 'user',
      label: 'Customer',
      render: (value: any, row: any) => (
        <div>
          <div className="fw-medium">{value?.name || 'Unknown'}</div>
          {value?.email && <small className="text-muted">{value.email}</small>}
        </div>
      )
    },
    {
      key: 'total',
      label: 'Total',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: any = {
          pending: 'warning',
          processing: 'info',
          shipped: 'primary',
          delivered: 'success',
          cancelled: 'danger'
        };
        return (
          <span className={`badge bg-${statusColors[value] || 'secondary'}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (value: string) => {
        const colors: any = { paid: 'success', pending: 'warning', failed: 'danger', refunded: 'secondary' };
        return <span className={`badge bg-${colors[value] || 'secondary'}`}>{value || 'N/A'}</span>;
      }
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: '_id',
      label: 'Action',
      render: (_: any, row: any) => (
        <a
          href={`/order-detail?id=${row._id || row.id}`}
          className="btn btn-primary btn-sm"
        >
          View Details
        </a>
      )
    }
  ];

  return (
    <Layout pageTitle="Orders">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">All Orders {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}</h4>
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
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading orders from MongoDB...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-package-variant" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No Orders Yet</h5>
                  <p className="text-muted">Orders will appear here when customers make purchases.</p>
                </div>
              ) : (
                <InteractiveTable
                  data={orders}
                  columns={columns}
                  showActions={false}
                  itemsPerPage={15}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
