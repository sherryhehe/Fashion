'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function CustomerDetail() {
  const customer = {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    status: 'Active',
    joinDate: '2023-06-15',
    lastOrder: '2024-01-15',
    totalOrders: 47,
    totalSpent: 4299.99,
    avatar: '/assets/images/users/avatar-1.jpg',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    preferences: {
      newsletter: true,
      sms: false,
      email: true
    },
    recentOrders: [
      {
        id: 'ORD-001',
        date: '2024-01-15',
        status: 'Delivered',
        total: 299.99,
        items: 3
      },
      {
        id: 'ORD-002',
        date: '2024-01-10',
        status: 'Processing',
        total: 129.99,
        items: 1
      },
      {
        id: 'ORD-003',
        date: '2024-01-05',
        status: 'Delivered',
        total: 89.99,
        items: 2
      }
    ],
    notes: [
      {
        id: 1,
        date: '2024-01-15',
        author: 'Admin',
        note: 'Customer requested expedited shipping for latest order.'
      },
      {
        id: 2,
        date: '2024-01-10',
        author: 'Support',
        note: 'Resolved billing inquiry regarding order ORD-002.'
      }
    ]
  };

  return (
    <Layout pageTitle="Customer Detail">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/customer-list">Customers</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{customer.name}</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Customer Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center">
                    <img src={customer.avatar} alt={customer.name} className="avatar-lg me-3" />
                    <div>
                      <h4 className="card-title mb-1">{customer.name}</h4>
                      <p className="text-muted mb-0">{customer.email}</p>
                      <small className="text-muted">Customer since {customer.joinDate}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className={`badge ${customer.status === 'Active' ? 'bg-success' : 'bg-danger'} fs-6`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Customer Information */}
          <div className="col-lg-8">
            {/* Personal Information */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Personal Information</h5>
              </div>
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
                    <p className="mb-0">{customer.phone}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Customer ID</label>
                    <p className="mb-0">{customer.id}</p>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">Address</label>
                    <p className="mb-0">
                      {customer.address.street}<br />
                      {customer.address.city}, {customer.address.state} {customer.address.zip}<br />
                      {customer.address.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Recent Orders</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td><Link href="/order-detail" className="text-primary">{order.id}</Link></td>
                          <td>{order.date}</td>
                          <td><span className="badge bg-primary">{order.items}</span></td>
                          <td>${order.total.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${order.status === 'Delivered' ? 'bg-success' : order.status === 'Processing' ? 'bg-info' : 'bg-warning'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="bx bx-show"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Customer Notes</h5>
              </div>
              <div className="card-body">
                {customer.notes.map((note) => (
                  <div key={note.id} className="border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{note.note}</h6>
                        <small className="text-muted">By {note.author} on {note.date}</small>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-3">
                  <div className="input-group">
                    <input type="text" className="form-control" placeholder="Add a note..." />
                    <button className="btn btn-primary text-nowrap" type="button" style={{ minWidth: '120px' }}>
                      <i className="bx bx-plus"></i> Add Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Summary */}
          <div className="col-lg-4">
            {/* Customer Stats */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Customer Statistics</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6">
                    <div className="border-end">
                      <h4 className="text-primary mb-1">{customer.totalOrders}</h4>
                      <p className="text-muted mb-0">Total Orders</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <h4 className="text-success mb-1">${customer.totalSpent.toFixed(2)}</h4>
                    <p className="text-muted mb-0">Total Spent</p>
                  </div>
                </div>
                <hr />
                <div className="row text-center">
                  <div className="col-6">
                    <div className="border-end">
                      <h4 className="text-info mb-1">$91.49</h4>
                      <p className="text-muted mb-0">Avg Order</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <h4 className="text-warning mb-1">7</h4>
                    <p className="text-muted mb-0">Days Since Last Order</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Communication Preferences</h5>
              </div>
              <div className="card-body">
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="newsletter" checked={customer.preferences.newsletter} />
                  <label className="form-check-label" htmlFor="newsletter">
                    Newsletter Subscription
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="email" checked={customer.preferences.email} />
                  <label className="form-check-label" htmlFor="email">
                    Email Notifications
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="sms" checked={customer.preferences.sms} />
                  <label className="form-check-label" htmlFor="sms">
                    SMS Notifications
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-primary">
                    <i className="bx bx-edit me-1"></i>Edit Customer
                  </button>
                  <button className="btn btn-outline-info">
                    <i className="bx bx-envelope me-1"></i>Send Email
                  </button>
                  <button className="btn btn-outline-success">
                    <i className="bx bx-phone me-1"></i>Call Customer
                  </button>
                  <button className="btn btn-outline-warning">
                    <i className="bx bx-plus me-1"></i>Create Order
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bx bx-printer me-1"></i>Print Details
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Tags */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Customer Tags</h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-primary">VIP</span>
                  <span className="badge bg-success">Loyal</span>
                  <span className="badge bg-info">High Value</span>
                </div>
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Add tag..." />
                  <button className="btn btn-outline-primary" type="button">
                    <i className="bx bx-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
