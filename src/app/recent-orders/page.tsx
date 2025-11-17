'use client';

import Layout from '@/components/layout/Layout';
import { InteractiveTable } from '@/components';
import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api';

export default function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll({ limit: 10 });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #' },
    {
      key: 'total',
      label: 'Total',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`badge bg-${
          value === 'delivered' ? 'success' :
          value === 'processing' ? 'primary' :
          value === 'shipped' ? 'info' : 'warning'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <Layout pageTitle="Recent Orders">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="header-title">Recent Orders</h4>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-2">Loading recent orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-package-variant" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No Recent Orders</h5>
                </div>
              ) : (
                <InteractiveTable data={orders} columns={columns} itemsPerPage={10} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
