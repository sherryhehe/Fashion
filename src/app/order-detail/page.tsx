'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useState } from 'react';

export default function OrderDetail() {
  // State for modals and functionality
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newStatus, setNewStatus] = useState('Processing');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [order, setOrder] = useState({
    id: 'ORD-001',
    status: 'Processing',
    date: '2024-01-15',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States'
      }
    },
    items: [
      {
        id: 1,
        name: 'G15 Gaming Laptop',
        image: '/assets/images/products/product-1(1).png',
        price: 240.59,
        quantity: 1,
        total: 240.59
      },
      {
        id: 2,
        name: 'Wireless Headphones',
        image: '/assets/images/products/product-3.png',
        price: 89.99,
        quantity: 2,
        total: 179.98
      }
    ],
    shipping: {
      method: 'Standard Shipping',
      cost: 9.99,
      tracking: 'TRK123456789'
    },
    payment: {
      method: 'Credit Card',
      status: 'Paid',
      transactionId: 'TXN123456789'
    },
    totals: {
      subtotal: 420.57,
      shipping: 9.99,
      tax: 34.24,
      total: 464.80
    },
    notes: 'Customer requested expedited shipping for the laptop.',
    timeline: [
      {
        status: 'Order Placed',
        date: '2024-01-15 10:30 AM',
        description: 'Order was placed successfully'
      },
      {
        status: 'Payment Confirmed',
        date: '2024-01-15 10:32 AM',
        description: 'Payment has been processed'
      },
      {
        status: 'Processing',
        date: '2024-01-15 11:00 AM',
        description: 'Order is being prepared for shipment'
      }
    ]
  });

  // Handler functions for button actions
  const handleUpdateStatus = () => {
    setShowStatusModal(true);
  };

  const handleStatusChange = () => {
    setOrder(prev => ({ ...prev, status: newStatus }));
    setShowStatusModal(false);
    alert(`Order status updated to: ${newStatus}`);
  };

  const handlePrintInvoice = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - Order ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { text-align: right; margin-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>Order #${order.id}</h2>
          </div>
          
          <div class="invoice-details">
            <p><strong>Date:</strong> ${order.date}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Transaction ID:</strong> ${order.payment.transactionId}</p>
          </div>
          
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p>${order.customer.name}<br>
            ${order.customer.email}<br>
            ${order.customer.phone}<br>
            ${order.customer.address.street}<br>
            ${order.customer.address.city}, ${order.customer.address.state} ${order.customer.address.zip}<br>
            ${order.customer.address.country}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: $${order.totals.subtotal.toFixed(2)}</p>
            <p>Shipping: $${order.shipping.cost.toFixed(2)}</p>
            <p>Tax: $${order.totals.tax.toFixed(2)}</p>
            <p><strong>Total: $${order.totals.total.toFixed(2)}</strong></p>
          </div>
          
          <div style="margin-top: 30px;">
            <p><strong>Payment Method:</strong> ${order.payment.method}</p>
            <p><strong>Shipping Method:</strong> ${order.shipping.method}</p>
            <p><strong>Tracking Number:</strong> ${order.shipping.tracking}</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendEmail = () => {
    setEmailSubject(`Order Update - Order #${order.id}`);
    setEmailMessage(`Dear ${order.customer.name},\n\nWe wanted to update you on your order #${order.id}.\n\nCurrent Status: ${order.status}\n\nThank you for your business!\n\nBest regards,\nLarkon Team`);
    setShowEmailModal(true);
  };

  const handleEmailSend = () => {
    // In a real application, you would send this via an API
    alert(`Email sent to ${order.customer.email}!\n\nSubject: ${emailSubject}\n\nMessage: ${emailMessage}`);
    setShowEmailModal(false);
    setEmailSubject('');
    setEmailMessage('');
  };

  const handleDuplicateOrder = () => {
    if (confirm('Are you sure you want to duplicate this order?')) {
      // In a real application, you would create a new order via API
      const newOrderId = `ORD-${Date.now()}`;
      alert(`Order duplicated successfully!\nNew Order ID: ${newOrderId}`);
      // You could redirect to the new order or stay on current page
    }
  };

  return (
    <Layout pageTitle="Order Detail">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/orders-list">Orders</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Order #{order.id}</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Order Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h4 className="card-title mb-1">Order #{order.id}</h4>
                    <p className="text-muted mb-0">Placed on {order.date}</p>
                  </div>
                  <div className="text-end">
                    <span className={`badge ${order.status === 'Processing' ? 'bg-info' : order.status === 'Delivered' ? 'bg-success' : order.status === 'Pending' ? 'bg-warning' : 'bg-danger'} fs-6`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Order Items */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Order Items</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img src={item.image} alt={item.name} className="img-fluid me-3" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                              <div>
                                <h6 className="mb-1">{item.name}</h6>
                                <small className="text-muted">SKU: PROD-{item.id.toString().padStart(4, '0')}</small>
                              </div>
                            </div>
                          </td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>
                            <span className="badge bg-primary">{item.quantity}</span>
                          </td>
                          <td className="fw-semibold">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Order Timeline</h5>
              </div>
              <div className="card-body">
                <div className="timeline">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h6 className="mb-1">{event.status}</h6>
                        <p className="text-muted mb-1">{event.description}</p>
                        <small className="text-muted">{event.date}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            {/* Customer Information */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Customer Information</h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <img src="/assets/images/users/avatar-1.jpg" alt="Customer" className="avatar-sm me-3" />
                  <div>
                    <h6 className="mb-0">{order.customer.name}</h6>
                    <small className="text-muted">{order.customer.email}</small>
                  </div>
                </div>
                <div className="mb-2">
                  <strong>Phone:</strong> {order.customer.phone}
                </div>
                <div>
                  <strong>Address:</strong><br />
                  {order.customer.address.street}<br />
                  {order.customer.address.city}, {order.customer.address.state} {order.customer.address.zip}<br />
                  {order.customer.address.country}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${order.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>${order.shipping.cost.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>${order.totals.tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong>
                  <strong>${order.totals.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Shipping Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <strong>Method:</strong> {order.shipping.method}
                </div>
                <div className="mb-2">
                  <strong>Tracking:</strong> {order.shipping.tracking}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className="badge bg-info ms-2">In Transit</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Payment Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <strong>Method:</strong> {order.payment.method}
                </div>
                <div className="mb-2">
                  <strong>Transaction ID:</strong> {order.payment.transactionId}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className="badge bg-success ms-2">{order.payment.status}</span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Order Notes</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">{order.notes}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card mt-3">
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={handleUpdateStatus}
                  >
                    <i className="bx bx-edit me-1"></i>Update Status
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handlePrintInvoice}
                  >
                    <i className="bx bx-printer me-1"></i>Print Invoice
                  </button>
                  <button 
                    className="btn btn-outline-info"
                    onClick={handleSendEmail}
                  >
                    <i className="bx bx-send me-1"></i>Send Email
                  </button>
                  <button 
                    className="btn btn-outline-warning"
                    onClick={handleDuplicateOrder}
                  >
                    <i className="bx bx-copy me-1"></i>Duplicate Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Order Status</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="statusSelect" className="form-label">Select New Status:</label>
                  <select 
                    className="form-select" 
                    id="statusSelect"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Current Status:</label>
                  <span className={`badge ${
                    order.status === 'Processing' ? 'bg-info' : 
                    order.status === 'Delivered' ? 'bg-success' : 
                    order.status === 'Pending' ? 'bg-warning' : 
                    order.status === 'Cancelled' ? 'bg-danger' : 'bg-secondary'
                  } ms-2`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleStatusChange}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showEmailModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Email to Customer</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEmailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">To:</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={order.customer.email}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="emailSubject" className="form-label">Subject:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="emailSubject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="emailMessage" className="form-label">Message:</label>
                  <textarea 
                    className="form-control" 
                    id="emailMessage"
                    rows={8}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                  ></textarea>
                </div>
                <div className="alert alert-info">
                  <i className="bx bx-info-circle me-2"></i>
                  <strong>Tip:</strong> You can use the following placeholders in your message:
                  <ul className="mb-0 mt-2">
                    <li><code>{'{customer_name}'}</code> - Customer's name</li>
                    <li><code>{'{order_id}'}</code> - Order ID</li>
                    <li><code>{'{order_status}'}</code> - Current order status</li>
                    <li><code>{'{tracking_number}'}</code> - Tracking number</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleEmailSend}
                >
                  <i className="bx bx-send me-1"></i>Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
