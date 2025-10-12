'use client';

import { Layout, InteractiveTable } from '@/components';
import { useState, useEffect } from 'react';

export default function CustomerList() {
  const [statusFilter, setStatusFilter] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('role', 'customer');
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`http://localhost:8000/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (value: string) => value || 'N/A' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`badge ${value === 'active' ? 'bg-success' : 'bg-secondary'}`}>
          {value}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (item: any) => window.location.href = `/customer-detail?id=${item._id || item.id}`,
      className: 'btn-primary btn-sm'
    }
  ];

  return (
    <Layout pageTitle="Customers">
                <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">All Customers {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}</h4>
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
                  </select>
          </div>
        </div>

              {/* Customers Table */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading customers from MongoDB...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-account-multiple" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No Customers Yet</h5>
                  <p className="text-muted">Customers will appear here when they register.</p>
                </div>
              ) : (
                <InteractiveTable
                  data={customers}
                  columns={columns}
                  actions={actions}
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
