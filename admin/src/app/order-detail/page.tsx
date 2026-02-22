'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/utils/currencyHelper';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import { ordersApi } from '@/lib/api';

interface OrderData {
  id?: string;
  _id?: string;
  orderNumber?: string;
  status?: string;
  date?: string;
  createdAt?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
  };
  user?: {
    name?: string;
    email?: string;
    phone?: string | null;
  };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  items?: Array<{
    id?: string;
    _id?: string;
    productId?: string;
    productName?: string;
    name?: string;
    image?: string;
    price?: number;
    quantity?: number;
    total?: number;
    size?: string;
    color?: string;
  }>;
  shipping?: {
    method?: string;
    cost?: number;
    tracking?: string;
  };
  shippingCost?: number;
  payment?: {
    method?: string;
    status?: string;
    transactionId?: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  totals?: {
    subtotal?: number;
    shipping?: number;
    tax?: number;
    total?: number;
  };
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  timeline?: Array<{
    status?: string;
    date?: string;
    description?: string;
  }>;
}

export default function OrderDetail() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const { dialog, showConfirm, handleCancel, handleConfirm } = useConfirmDialog();
  
  // State for modals and functionality
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevOrderId, setPrevOrderId] = useState<string | null>(null);
  const [nextOrderId, setNextOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError('Order ID is required');
      setLoading(false);
    }
  }, [orderId]);

  // Fetch order list to get prev/next for navigation arrows
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    ordersApi.getAll({ limit: 500, page: 1 }).then((res: any) => {
      if (cancelled) return;
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      const ids = list.map((o: any) => o._id || o.id).filter(Boolean);
      const idx = ids.indexOf(orderId);
      if (idx > 0) setPrevOrderId(ids[idx - 1]);
      else setPrevOrderId(null);
      if (idx >= 0 && idx < ids.length - 1) setNextOrderId(ids[idx + 1]);
      else setNextOrderId(null);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersApi.getById(orderId!);
      const orderData = response.data;
      
      // Transform API response to match UI format
      const shippingAddress = orderData.shippingAddress || {};
      const user = orderData.user || {};
      
      const transformedOrder: OrderData = {
        id: orderData.orderNumber || orderData._id,
        _id: orderData._id,
        orderNumber: orderData.orderNumber,
        status: orderData.status || 'pending',
        date: orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : '',
        customer: {
          name: user.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || 'N/A',
          email: user.email || shippingAddress.email || 'N/A',
          phone: user.phone || shippingAddress.phone || 'N/A',
          address: {
            street: shippingAddress.address || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            zip: shippingAddress.zip || '',
            country: shippingAddress.country || ''
          }
        },
        items: (orderData.items || []).map((item: any) => ({
          id: item._id || item.productId,
          _id: item._id,
          productId: item.productId,
          name: item.productName || item.name,
          productName: item.productName,
          image: item.image || '/assets/images/products/product-1(1).png',
          price: item.price || 0,
          quantity: item.quantity || 0,
          total: item.total || (item.price || 0) * (item.quantity || 0),
          size: item.size,
          color: item.color
        })),
        shipping: {
          method: 'Standard Shipping',
          cost: orderData.shippingCost || 0,
          tracking: 'TRK' + (orderData.orderNumber || orderData._id || '').slice(-9)
        },
        payment: {
          method: orderData.paymentMethod || 'N/A',
          status: orderData.paymentStatus || 'pending',
          transactionId: orderData._id || 'N/A'
        },
        totals: {
          subtotal: orderData.subtotal || 0,
          shipping: orderData.shippingCost || 0,
          tax: orderData.tax || 0,
          total: orderData.total || 0
        },
        notes: orderData.notes || '',
        timeline: (orderData.timeline || []).map((event: any) => ({
          status: event.status || 'Unknown',
          date: event.date ? new Date(event.date).toLocaleString() : '',
          description: event.description || ''
        }))
      };
      
      setOrder(transformedOrder);
      setNewStatus(transformedOrder.status || 'pending');
    } catch (err: any) {
      console.error('Failed to fetch order:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for button actions
  const handleUpdateStatus = () => {
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!order || !order._id) return;
    
    try {
      await ordersApi.updateStatus(order._id, newStatus.toLowerCase());
      setOrder(prev => prev ? { ...prev, status: newStatus.toLowerCase() } : null);
      setShowStatusModal(false);
      alert(`Order status updated to: ${newStatus}`);
      // Refresh order data
      await fetchOrder();
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      alert(`Failed to update order status: ${err.message || 'Unknown error'}`);
    }
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
                  <td>${formatCurrency(item.price)}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: ${formatCurrency(order.totals.subtotal)}</p>
            <p>Shipping: ${formatCurrency(order.shipping.cost)}</p>
            <p>Tax: ${formatCurrency(order.totals.tax)}</p>
            <p><strong>Total: ${formatCurrency(order.totals.total)}</strong></p>
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
    if (!order) return;
    setEmailSubject(`Order Update - Order #${order.orderNumber || order.id}`);
    setEmailMessage(`Dear ${order.customer?.name || 'Customer'},\n\nWe wanted to update you on your order #${order.orderNumber || order.id}.\n\nCurrent Status: ${order.status}\n\nThank you for your business!\n\nBest regards,\nShopo Team`);
    setShowEmailModal(true);
  };

  const handleEmailSend = () => {
    // In a real application, you would send this via an API
    alert(`Email sent to ${order.customer.email}!\n\nSubject: ${emailSubject}\n\nMessage: ${emailMessage}`);
    setShowEmailModal(false);
    setEmailSubject('');
    setEmailMessage('');
  };

  const handleDuplicateOrder = async () => {
    const confirmed = await showConfirm({
      title: 'Duplicate Order',
      message: 'Are you sure you want to duplicate this order?',
      confirmText: 'Duplicate',
      cancelText: 'Cancel',
      variant: 'info',
    });

    if (confirmed) {
      // In a real application, you would create a new order via API
      const newOrderId = `ORD-${Date.now()}`;
      alert(`Order duplicated successfully!\nNew Order ID: ${newOrderId}`);
      // You could redirect to the new order or stay on current page
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Order Detail">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout pageTitle="Order Detail">
        <div className="container-fluid">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error || 'Order not found'}</p>
            <hr />
            <Link href="/orders-list" className="btn btn-primary">Back to Orders</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Order Detail">
      <div className="container-fluid">
        {/* Breadcrumb and prev/next navigation */}
        <div className="row mb-3">
          <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/orders-list">Orders</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Order #{order.orderNumber || order.id}</li>
              </ol>
            </nav>
            <div className="d-flex gap-2">
              {prevOrderId ? (
                <Link href={`/order-detail?id=${prevOrderId}`} className="btn btn-sm btn-outline-primary">
                  <i className="mdi mdi-arrow-left me-1"></i>Previous order
                </Link>
              ) : null}
              {nextOrderId ? (
                <Link href={`/order-detail?id=${nextOrderId}`} className="btn btn-sm btn-outline-primary">
                  Next order<i className="mdi mdi-arrow-right ms-1"></i>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {/* Order Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h4 className="card-title mb-1">Order #{order.orderNumber || order.id}</h4>
                    <p className="text-muted mb-0">Placed on {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A')}</p>
                  </div>
                  <div className="text-end">
                    <span className={`badge ${
                      order.status === 'processing' ? 'bg-info' : 
                      order.status === 'delivered' ? 'bg-success' : 
                      order.status === 'pending' ? 'bg-warning' : 
                      order.status === 'cancelled' ? 'bg-danger' : 
                      'bg-secondary'
                    } fs-6`}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
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
                      {(order.items || []).map((item, index) => (
                        <tr key={item._id || item.id || index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img src={item.image || '/assets/images/products/product-1(1).png'} alt={item.name || item.productName} className="img-fluid me-3" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                              <div>
                                <h6 className="mb-1">{item.name || item.productName || 'Unknown Product'}</h6>
                                <small className="text-muted">
                                  {item.size && `Size: ${item.size}`}
                                  {item.size && item.color && ' | '}
                                  {item.color && `Color: ${item.color}`}
                                  {!item.size && !item.color && `SKU: ${item.productId || item.id || 'N/A'}`}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>{formatCurrency(item.price || 0)}</td>
                          <td>
                            <span className="badge bg-primary">{item.quantity || 0}</span>
                          </td>
                          <td className="fw-semibold">{formatCurrency(item.total || 0)}</td>
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
                  {(order.timeline || []).length > 0 ? (
                    order.timeline.map((event, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <h6 className="mb-1">{event.status || 'Unknown'}</h6>
                          <p className="text-muted mb-1">{event.description || 'No description'}</p>
                          <small className="text-muted">{event.date || 'Unknown date'}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No timeline events available</p>
                  )}
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
                    <h6 className="mb-0">{order.customer?.name || 'N/A'}</h6>
                    <small className="text-muted">{order.customer?.email || 'N/A'}</small>
                  </div>
                </div>
                <div className="mb-2">
                  <strong>Phone:</strong> {order.customer?.phone || 'N/A'}
                </div>
                <div>
                  <strong>Address:</strong><br />
                  {order.customer?.address?.street || ''}<br />
                  {order.customer?.address?.city || ''}{order.customer?.address?.state ? `, ${order.customer.address.state}` : ''} {order.customer?.address?.zip || ''}<br />
                  {order.customer?.address?.country || ''}
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
                  <span>{formatCurrency(order.totals?.subtotal || order.subtotal || 0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.totals?.shipping || order.shippingCost || 0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.totals?.tax || order.tax || 0)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong>
                  <strong>{formatCurrency(order.totals?.total || order.total || 0)}</strong>
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
                  <strong>Method:</strong> {order.shipping?.method || 'Standard Shipping'}
                </div>
                <div className="mb-2">
                  <strong>Tracking:</strong> {order.shipping?.tracking || 'N/A'}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={`badge ${
                    order.status === 'shipped' ? 'bg-info' : 
                    order.status === 'delivered' ? 'bg-success' : 
                    'bg-warning'
                  } ms-2`}>
                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                  </span>
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
                  <strong>Method:</strong> {order.payment?.method || order.paymentMethod || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Transaction ID:</strong> {order.payment?.transactionId || order._id || 'N/A'}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={`badge ${
                    order.payment?.status === 'paid' || order.paymentStatus === 'paid' ? 'bg-success' : 
                    order.payment?.status === 'failed' || order.paymentStatus === 'failed' ? 'bg-danger' : 
                    'bg-warning'
                  } ms-2`}>
                    {order.payment?.status || order.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Order Notes</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">{order.notes || 'No notes available'}</p>
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
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Current Status:</label>
                  <span className={`badge ${
                    order.status === 'processing' ? 'bg-info' : 
                    order.status === 'delivered' ? 'bg-success' : 
                    order.status === 'pending' ? 'bg-warning' : 
                    order.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                  } ms-2`}>
                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
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
                    value={order.customer?.email || ''}
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        variant={dialog.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Layout>
  );
}
