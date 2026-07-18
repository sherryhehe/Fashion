'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import { formatCurrency } from '@/utils/currencyHelper';
import { getProductImageUrl } from '@/utils/imageHelper';

export default function OrderDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getById(orderId!);
      setOrder(response.data);
      setNewStatus(response.data?.status || '');
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    try {
      setUpdatingStatus(true);
      await ordersApi.updateStatus(orderId!, newStatus);
      setOrder((prev: any) => ({ ...prev, status: newStatus }));
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!order) return;
    const addr = order.shippingAddress || {};
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html><html><head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body{font-family:Arial,sans-serif;margin:20px}
            table{width:100%;border-collapse:collapse;margin-bottom:20px}
            th,td{border:1px solid #ddd;padding:8px;text-align:left}
            th{background:#f2f2f2}
            .totals{text-align:right}
            @media print{body{margin:0}}
          </style>
        </head><body>
          <h1 style="text-align:center">INVOICE</h1>
          <h2 style="text-align:center">Order #${order.orderNumber}</h2>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <h3>Ship To:</h3>
          <p>${addr.fullName || order.user?.name || ''}<br>
          ${addr.address || addr.street || ''}<br>
          ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || addr.zip || ''}<br>
          ${addr.country || ''}</p>
          <table><thead><tr><th>Product</th><th>Size</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
          <tbody>${(order.items || []).map((item: any) => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.size || '-'}</td>
              <td>${formatCurrency(item.price)}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.total)}</td>
            </tr>`).join('')}
          </tbody></table>
          <div class="totals">
            <p>Subtotal: ${formatCurrency(order.subtotal)}</p>
            <p>Shipping: ${formatCurrency(order.shippingCost || 0)}</p>
            ${order.platformFee ? `<p>Platform Fee: ${formatCurrency(order.platformFee)}</p>` : ''}
            ${order.transactionFee ? `<p>Transaction Fee: ${formatCurrency(order.transactionFee)}</p>` : ''}
            <p><strong>Total: ${formatCurrency(order.total)}</strong></p>
          </div>
          <p><strong>Payment:</strong> ${order.paymentMethod} — ${order.paymentStatus}</p>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Order Detail">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading order...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout pageTitle="Order Detail">
        <div className="text-center py-5">
          <h5>Order not found</h5>
          <Link href="/orders-list" className="btn btn-primary mt-3">Back to Orders</Link>
        </div>
      </Layout>
    );
  }

  const addr = order.shippingAddress || {};
  const statusColors: any = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger'
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
                <li className="breadcrumb-item active">Order #{order.orderNumber}</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Order Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <h4 className="card-title mb-1">Order #{order.orderNumber}</h4>
                    <p className="text-muted mb-0">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`badge bg-${statusColors[order.status] || 'secondary'} fs-6`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Order Items + Timeline */}
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
                        <th>Size</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item: any, index: number) => {
                        const imgUrl = item.productImage
                          ? getProductImageUrl([item.productImage], 0, '/assets/images/products/product-1.png')
                          : '/assets/images/products/product-1.png';
                        return (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={imgUrl}
                                  alt={item.productName}
                                  className="me-3 rounded"
                                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png'; }}
                                />
                                <div>
                                  <h6 className="mb-0">{item.productName}</h6>
                                  {item.color && <small className="text-muted">Color: {item.color}</small>}
                                </div>
                              </div>
                            </td>
                            <td>{item.size || '-'}</td>
                            <td>{formatCurrency(item.price)}</td>
                            <td><span className="badge bg-primary">{item.quantity}</span></td>
                            <td className="fw-semibold">{formatCurrency(item.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="card mt-3">
                <div className="card-header">
                  <h5 className="card-title mb-0">Order Timeline</h5>
                </div>
                <div className="card-body">
                  <div className="timeline">
                    {[...order.timeline].reverse().map((event: any, index: number) => (
                      <div key={index} className="d-flex mb-3">
                        <div className="me-3 mt-1">
                          <span className={`badge bg-${statusColors[event.status] || 'secondary'} rounded-circle p-2`}>
                            <i className="bx bx-check"></i>
                          </span>
                        </div>
                        <div>
                          <h6 className="mb-1 text-capitalize">{event.status}</h6>
                          <p className="text-muted mb-0 small">{event.description}</p>
                          <small className="text-muted">{new Date(event.date).toLocaleString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Customer Info */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Customer Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <strong>Name:</strong> {order.user?.name || addr.fullName || 'N/A'}
                </div>
                {order.user?.email && (
                  <div className="mb-2">
                    <strong>Email:</strong> {order.user.email}
                  </div>
                )}
                {order.user?.phone && (
                  <div className="mb-2">
                    <strong>Phone:</strong> {order.user.phone}
                  </div>
                )}
                <hr />
                <strong>Shipping Address:</strong>
                <div className="mt-1 text-muted">
                  {addr.fullName && <div>{addr.fullName}</div>}
                  {addr.phone && <div>{addr.phone}</div>}
                  {(addr.address || addr.street) && <div>{addr.address || addr.street}</div>}
                  {addr.city && <div>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode || addr.zip || ''}</div>}
                  {addr.country && <div>{addr.country}</div>}
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
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shippingCost || 0)}</span>
                </div>
                {order.platformFee > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Platform Fee:</span>
                    <span>{formatCurrency(order.platformFee)}</span>
                  </div>
                )}
                {order.transactionFee > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Transaction Fee:</span>
                    <span>{formatCurrency(order.transactionFee)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong>
                  <strong>{formatCurrency(order.total)}</strong>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Payment Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <strong>Method:</strong> <span className="text-capitalize">{order.paymentMethod}</span>
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={`badge bg-${order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'danger' : 'warning'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="card mt-3">
                <div className="card-header">
                  <h5 className="card-title mb-0">Order Notes</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-0">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="card mt-3">
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={() => setShowStatusModal(true)}>
                    <i className="bx bx-edit me-1"></i>Update Status
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handlePrintInvoice}>
                    <i className="bx bx-printer me-1"></i>Print Invoice
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
                <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Current Status:</label>
                  <span className={`badge bg-${statusColors[order.status] || 'secondary'} ms-2`}>
                    {order.status}
                  </span>
                </div>
                <div className="mb-3">
                  <label htmlFor="statusSelect" className="form-label">New Status:</label>
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
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || newStatus === order.status}
                >
                  {updatingStatus ? <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</> : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
