'use client';

import React, { useState } from 'react';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: any) => void;
}

export default function AddReviewModal({ isOpen, onClose, onSubmit }: AddReviewModalProps) {
  const [formData, setFormData] = useState({
    productId: '',
    customerName: '',
    customerEmail: '',
    rating: 5,
    review: '',
    status: 'pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      productId: '',
      customerName: '',
      customerEmail: '',
      rating: 5,
      review: '',
      status: 'pending'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal-backdrop fade show"></div>
      
      {/* Modal */}
      <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Review</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="productId" className="form-label">Product</label>
                  <select 
                    className="form-select" 
                    id="productId" 
                    name="productId" 
                    value={formData.productId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Product</option>
                    <option value="1">G15 Gaming Laptop</option>
                    <option value="2">Sony Alpha Camera</option>
                    <option value="3">Wireless Headphones</option>
                    <option value="4">Smart Watch</option>
                    <option value="5">Bluetooth Speaker</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select 
                    className="form-select" 
                    id="status" 
                    name="status" 
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="customerName" className="form-label">Customer Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="customerName" 
                    name="customerName" 
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="customerEmail" className="form-label">Customer Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="customerEmail" 
                    name="customerEmail" 
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="rating" className="form-label">Rating</label>
                <div className="d-flex align-items-center">
                  <input 
                    type="range" 
                    className="form-range me-3" 
                    id="rating" 
                    name="rating" 
                    min="1" 
                    max="5" 
                    value={formData.rating}
                    onChange={handleChange}
                    style={{ width: '200px' }}
                  />
                  <div className="d-flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i 
                        key={star}
                        className={`bx ${star <= formData.rating ? 'bxs-star text-warning' : 'bx-star text-muted'} fs-20 me-1`}
                      ></i>
                    ))}
                    <span className="ms-2 fw-semibold">{formData.rating}/5</span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="review" className="form-label">Review Text</label>
                <textarea 
                  className="form-control" 
                  id="review" 
                  name="review" 
                  rows={4}
                  value={formData.review}
                  onChange={handleChange}
                  placeholder="Write your review here..."
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Review
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </>
  );
}
