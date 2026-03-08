'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useHomeCategory, useUpdateHomeCategory } from '@/hooks/useApi';
import { useNotificationContext } from '@/contexts/NotificationContext';

export default function HomeCategoryEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { data: category, isLoading } = useHomeCategory(id);
  const updateCategory = useUpdateHomeCategory();
  const { addNotification } = useNotificationContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    order: 0,
    status: 'active' as 'active' | 'inactive',
    productIdsText: '',
  });

  useEffect(() => {
    if (category) {
      const productIds = (category.productIds || []) as string[];
      const idsText = Array.isArray(productIds)
        ? productIds.map((x: any) => (typeof x === 'string' ? x : x?.toString?.() || x)).join('\n')
        : '';
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        order: category.order ?? 0,
        status: (category.status as 'active' | 'inactive') || 'active',
        productIdsText: idsText,
      });
    }
  }, [category]);

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
    if (!id) return;
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
      await updateCategory.mutateAsync({
        id,
        data: {
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          order: formData.order,
          status: formData.status,
          productIds,
        },
      });
      addNotification('success', 'Home category updated');
      router.push('/home-categories-list');
    } catch (err: any) {
      addNotification('error', err?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <Layout pageTitle="Edit Home Category">
        <div className="container-fluid"><p>Missing category ID.</p><Link href="/home-categories-list">Back to list</Link></div>
      </Layout>
    );
  }

  if (isLoading && !category) {
    return (
      <Layout pageTitle="Edit Home Category">
        <div className="container-fluid text-center py-5"><div className="spinner-border text-primary" /><p className="mt-2">Loading...</p></div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Edit Home Category">
      <div className="container-fluid">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/home-categories-list">Home Categories</Link></li>
            <li className="breadcrumb-item active">Edit</li>
          </ol>
        </nav>
        <div className="card">
          <div className="card-header"><h4 className="mb-0">Edit Home Category</h4></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Slug (optional)</label>
                <input type="text" className="form-control" name="slug" value={formData.slug} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Order</label>
                <input type="number" className="form-control" name="order" value={formData.order} onChange={handleChange} min={0} />
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
                  placeholder="One per line or comma-separated"
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
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
