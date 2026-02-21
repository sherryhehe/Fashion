'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { notificationsApi } from '@/lib/api';
import { getApiUrl } from '@/utils/apiHelper';

export default function NotificationCreate() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    targetSegment: '',
    priority: 'normal',
    actionText: '',
    actionUrl: '',
    discountCode: '',
    discountPercentage: '',
    expiryDate: '',
    scheduled: false,
    scheduledTime: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 NOTIFICATION FORM SUBMITTED');
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = '';

      // Upload image if provided
      if (imageFile) {
        console.log('📤 UPLOADING NOTIFICATION IMAGE...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', imageFile);

        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${getApiUrl()}/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.data.urls[0];
        console.log('✅ IMAGE UPLOADED:', imageUrl);
      }

      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetAudience: formData.targetAudience,
        targetSegment: formData.targetSegment || undefined,
        priority: formData.priority,
        image: imageUrl || undefined,
        actionText: formData.actionText || undefined,
        actionUrl: formData.actionUrl || undefined,
        discountCode: formData.discountCode || undefined,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined,
        expiryDate: formData.expiryDate || undefined,
        scheduled: formData.scheduled,
        scheduledTime: formData.scheduledTime || undefined,
      };

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 CREATING NOTIFICATION');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Notification Data:', notificationData);

      const response = await notificationsApi.create(notificationData);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ NOTIFICATION CREATED SUCCESSFULLY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Response:', response);

      router.push('/notification-list');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ NOTIFICATION CREATION FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);

      if (error.status === 401) {
        console.warn('🔐 Authentication failed - redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout pageTitle="Create Notification">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/notification-list">Notifications</Link></li>
                <li className="breadcrumb-item active">Create Notification</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Create Notification Form */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Notification Details</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Basic Info */}
                    <div className="col-12 mb-3">
                      <label htmlFor="title" className="form-label">Notification Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        placeholder="e.g., 50% Off Flash Sale!"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        maxLength={100}
                      />
                      <small className="text-muted">Max 100 characters</small>
                    </div>

                    <div className="col-12 mb-3">
                      <label htmlFor="message" className="form-label">Message <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="Enter your notification message here..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        maxLength={500}
                      ></textarea>
                      <small className="text-muted">Max 500 characters</small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="type" className="form-label">Notification Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="general">📢 General Announcement</option>
                        <option value="discount">💰 Discount Offer</option>
                        <option value="sale">🏷️ Sale/Promotion</option>
                        <option value="new_product">🆕 New Product</option>
                        <option value="order_update">📦 Order Update</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="priority" className="form-label">Priority</label>
                      <select
                        className="form-select"
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">🔴 Urgent</option>
                      </select>
                    </div>

                    {/* Targeting */}
                    <div className="col-12 mb-3">
                      <hr className="my-2" />
                      <h6 className="text-muted">Target Audience</h6>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="targetAudience" className="form-label">Send To <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="targetAudience"
                        name="targetAudience"
                        value={formData.targetAudience}
                        onChange={handleChange}
                        required
                      >
                        <option value="all">👥 All Users</option>
                        <option value="specific">🎯 Specific Segment</option>
                      </select>
                    </div>

                    {formData.targetAudience === 'specific' && (
                      <div className="col-md-6 mb-3">
                        <label htmlFor="targetSegment" className="form-label">User Segment</label>
                        <select
                          className="form-select"
                          id="targetSegment"
                          name="targetSegment"
                          value={formData.targetSegment}
                          onChange={handleChange}
                        >
                          <option value="">Select Segment</option>
                          <option value="active">✅ Active Users</option>
                          <option value="inactive">💤 Inactive Users</option>
                          <option value="new">🆕 New Users</option>
                          <option value="vip">⭐ VIP Customers</option>
                        </select>
                      </div>
                    )}

                    {/* Discount Fields */}
                    {(formData.type === 'discount' || formData.type === 'sale') && (
                      <>
                        <div className="col-12 mb-3">
                          <hr className="my-2" />
                          <h6 className="text-muted">Discount Details</h6>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="discountCode" className="form-label">Discount Code</label>
                          <input
                            type="text"
                            className="form-control text-uppercase"
                            id="discountCode"
                            name="discountCode"
                            placeholder="e.g., FLASH50"
                            value={formData.discountCode}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="discountPercentage" className="form-label">Discount %</label>
                          <input
                            type="number"
                            className="form-control"
                            id="discountPercentage"
                            name="discountPercentage"
                            placeholder="e.g., 50"
                            min="0"
                            max="100"
                            value={formData.discountPercentage}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="expiryDate" className="form-label">Offer Expires On</label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}

                    {/* Action Button */}
                    <div className="col-12 mb-3">
                      <hr className="my-2" />
                      <h6 className="text-muted">Call to Action (Optional)</h6>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="actionText" className="form-label">Button Text</label>
                      <input
                        type="text"
                        className="form-control"
                        id="actionText"
                        name="actionText"
                        placeholder="e.g., Shop Now, View Deal"
                        value={formData.actionText}
                        onChange={handleChange}
                        maxLength={50}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="actionUrl" className="form-label">Action URL</label>
                      <input
                        type="text"
                        className="form-control"
                        id="actionUrl"
                        name="actionUrl"
                        placeholder="/products or /categories/sale"
                        value={formData.actionUrl}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="col-12 mb-4">
                      <hr className="my-2" />
                      <h6 className="text-muted">Notification Image (Optional)</h6>
                      <div className="border rounded p-3 bg-light">
                        <input
                          type="file"
                          className="form-control mb-3"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview && (
                          <div className="mt-2">
                            <small className="text-muted d-block mb-2">Preview:</small>
                            <div className="position-relative d-inline-block">
                              <img
                                src={imagePreview}
                                alt="Notification Preview"
                                className="img-fluid rounded border"
                                style={{ width: '200px', height: '120px', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                onClick={removeImage}
                                title="Remove image"
                              >
                                <i className="bx bx-x"></i>
                              </button>
                            </div>
                          </div>
                        )}
                        <small className="text-muted d-block mt-2">
                          <i className="bx bx-info-circle me-1"></i>
                          Recommended size: 1200x600px for best display
                        </small>
                      </div>
                    </div>

                    {/* Scheduling */}
                    <div className="col-12 mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="scheduled"
                          name="scheduled"
                          checked={formData.scheduled}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="scheduled">
                          Schedule for later
                        </label>
                      </div>
                    </div>

                    {formData.scheduled && (
                      <div className="col-md-6 mb-3">
                        <label htmlFor="scheduledTime" className="form-label">Schedule Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          id="scheduledTime"
                          name="scheduledTime"
                          value={formData.scheduledTime}
                          onChange={handleChange}
                          required={formData.scheduled}
                        />
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          {formData.scheduled ? 'Scheduling...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <i className="mdi mdi-send me-1"></i>
                          {formData.scheduled ? 'Schedule Notification' : 'Send Now'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        // Save as draft
                        console.log('💾 Saving as draft...');
                      }}
                    >
                      <i className="mdi mdi-content-save me-1"></i>
                      Save as Draft
                    </button>
                    <Link href="/notification-list" className="btn btn-outline-secondary">
                      <i className="mdi mdi-arrow-left me-1"></i>Cancel
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="mdi mdi-cellphone me-1"></i>
                  Mobile Preview
                </h5>
              </div>
              <div className="card-body">
                <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="bg-white rounded p-3 shadow-sm">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-fluid rounded mb-2"
                        style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0">
                        <div className="bg-primary rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                          <i className="mdi mdi-store text-white"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-2">
                        <h6 className="mb-1">{formData.title || 'Notification Title'}</h6>
                        <p className="text-muted small mb-2">{formData.message || 'Your notification message will appear here...'}</p>
                        {formData.actionText && (
                          <button className="btn btn-sm btn-primary">
                            {formData.actionText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <small className="text-muted d-block mt-2 text-center">
                    <i className="mdi mdi-information-outline me-1"></i>
                    This is how users will see it on their phones
                  </small>
                </div>

                {/* Notification Info */}
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Type:</span>
                    <span className="badge bg-primary">{formData.type.replace('_', ' ')}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Target:</span>
                    <span className="badge bg-info">{formData.targetAudience === 'all' ? 'All Users' : 'Specific Segment'}</span>
                  </div>
                  {formData.targetSegment && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Segment:</span>
                      <span className="badge bg-success">{formData.targetSegment}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Priority:</span>
                    <span className={`badge ${
                      formData.priority === 'urgent' ? 'bg-danger' : 
                      formData.priority === 'high' ? 'bg-warning' : 
                      'bg-secondary'
                    }`}>{formData.priority}</span>
                  </div>
                  {formData.scheduled && formData.scheduledTime && (
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Scheduled:</span>
                      <span className="badge bg-info">
                        {new Date(formData.scheduledTime).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="mdi mdi-lightbulb-outline me-1"></i>
                  Best Practices
                </h6>
                <ul className="mb-0 small text-muted">
                  <li>Keep title short and attention-grabbing</li>
                  <li>Message should be clear and concise</li>
                  <li>Add discount codes for promotions</li>
                  <li>Use images to increase engagement</li>
                  <li>Test with small segment first</li>
                  <li>Schedule for optimal times (evening/weekend)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
