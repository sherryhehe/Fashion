'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateHomeCategory } from '@/hooks/useApi';
import { useNotificationContext } from '@/contexts/NotificationContext';

export default function HomeCategoryAdd() {
  const router = useRouter();
  const createCategory = useCreateHomeCategory();
  const { addNotification } = useNotificationContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    order: 0,
    status: 'active' as 'active' | 'inactive',
    productIdsText: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'order') {
      setFormData(prev => ({ ...prev, order: parseInt(value, 10) || 0 }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addNotification('error', 'Name is required');
      return;
    }
    setLoading(true);
    try {
      const productIds = formData.productIdsText
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(Boolean);
      await createCategory.mutateAsync({
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        order: formData.order,
        status: formData.status,
        productIds,
      });
      addNotification('success', 'Home category created');
      router.push('/home-categories-list');
    } catch (err: any) {
      addNotification('error', err?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout pageTitle="Add Home Category">
      <div className="container-fluid">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/home-categories-list">Home Categories</Link></li>
            <li className="breadcrumb-item active">Add</li>
          </ol>
        </nav>
        <div className="card">
          <div className="card-header"><h4 className="mb-0">New Home Category</h4></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Summer Picks" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Slug (optional)</label>
                <input type="text" className="form-control" name="slug" value={formData.slug} onChange={handleChange} placeholder="summer-picks" />
              </div>
              <div className="mb-3">
                <label className="form-label">Order</label>
                <input type="number" className="form-control" name="order" value={formData.order} onChange={handleChange} min={0} />
                <small className="text-muted">Lower = higher on homepage. Shown below Featured.</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Product IDs</label>
                <textarea
                  className="form-control font-monospace"
                  name="productIdsText"
                  value={formData.productIdsText}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Paste product IDs, one per line or comma-separated. You can copy IDs from the product list."
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <Link href="/home-categories-list" className="btn btn-outline-secondary">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
