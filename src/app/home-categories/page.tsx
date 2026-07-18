'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { homeCategoriesApi, productsApi } from '@/lib/api';

interface HomeCat {
  _id: string;
  name: string;
  order: number;
  productIds: string[];
  status: 'active' | 'inactive';
}

const emptyForm = { name: '', order: 0, status: 'active' as 'active' | 'inactive', productIds: [] as string[] };

export default function HomeCategories() {
  const [cats, setCats] = useState<HomeCat[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [productSearch, setProductSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [cRes, pRes] = await Promise.all([
        homeCategoriesApi.getAll(),
        productsApi.getAll({ limit: 500 }),
      ]);
      setCats(Array.isArray((cRes as any).data) ? (cRes as any).data : []);
      setProducts(Array.isArray((pRes as any).data) ? (pRes as any).data : []);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Failed to load featured categories');
    } finally {
      setLoading(false);
    }
  };

  const productById = useMemo(() => {
    const m = new Map<string, any>();
    products.forEach((p) => m.set(String(p._id), p));
    return m;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.brand || '').toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: cats.length });
    setProductSearch('');
    setShowForm(true);
  };

  const openEdit = (c: HomeCat) => {
    setEditingId(c._id);
    setForm({
      name: c.name || '',
      order: c.order ?? 0,
      status: c.status || 'active',
      productIds: (c.productIds || []).map((id: any) => String(id)),
    });
    setProductSearch('');
    setShowForm(true);
  };

  const toggleProduct = (id: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter((x) => x !== id)
        : [...prev.productIds, id],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Section name is required');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        order: Number(form.order) || 0,
        status: form.status,
        productIds: form.productIds,
      };
      if (editingId) {
        await homeCategoriesApi.update(editingId, payload);
      } else {
        await homeCategoriesApi.create(payload);
      }
      setShowForm(false);
      await fetchAll();
    } catch (e: any) {
      alert(e?.message || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: HomeCat) => {
    if (!confirm(`Delete the "${c.name}" section? This cannot be undone.`)) return;
    try {
      await homeCategoriesApi.delete(c._id);
      await fetchAll();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete section');
    }
  };

  const toggleStatus = async (c: HomeCat) => {
    try {
      await homeCategoriesApi.update(c._id, { status: c.status === 'active' ? 'inactive' : 'active' });
      await fetchAll();
    } catch (e: any) {
      alert(e?.message || 'Failed to update status');
    }
  };

  return (
    <Layout pageTitle="Featured Categories">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0">Featured Categories</h4>
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item"><Link href="/">Shopo</Link></li>
                <li className="breadcrumb-item active">Featured Categories</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="card-title mb-1">Home Screen Sections</h5>
                  <p className="text-muted small mb-0">
                    Create custom sections (e.g. &quot;International Brands&quot;) that appear on the app home screen. Pick the products each section shows.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                  <i className="bx bx-plus me-1"></i> Add Section
                </button>
              </div>

              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}

                {showForm && (
                  <form onSubmit={handleSave} className="border rounded p-3 mb-4 bg-light">
                    <h5 className="mb-3">{editingId ? 'Edit Section' : 'New Section'}</h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Section Name <span className="text-danger">*</span></label>
                        <input
                          className="form-control"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. International Brands"
                          required
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Order</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.order}
                          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                          min={0}
                        />
                        <small className="text-muted">Lower shows first.</small>
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <label className="form-label">
                      Products <span className="badge bg-primary ms-1">{form.productIds.length} selected</span>
                    </label>
                    <input
                      className="form-control mb-2"
                      placeholder="Search products by name or brand..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <div className="border rounded p-2 mb-3" style={{ maxHeight: 260, overflowY: 'auto', background: '#fff' }}>
                      {filteredProducts.length === 0 ? (
                        <p className="text-muted small mb-0 p-2">No products found.</p>
                      ) : (
                        filteredProducts.map((p: any) => {
                          const id = String(p._id);
                          const checked = form.productIds.includes(id);
                          return (
                            <div className="form-check" key={id}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`p-${id}`}
                                checked={checked}
                                onChange={() => toggleProduct(id)}
                              />
                              <label className="form-check-label" htmlFor={`p-${id}`}>
                                {p.name}
                                {p.brand ? <span className="text-muted small"> — {p.brand}</span> : null}
                              </label>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : editingId ? 'Update Section' : 'Create Section'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {loading ? (
                  <div className="text-center py-4">
                    <span className="spinner-border" role="status"></span>
                  </div>
                ) : cats.length === 0 ? (
                  <div className="alert alert-info mb-0">
                    No featured categories yet. Click <strong>Add Section</strong> to create one.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Section</th>
                          <th>Products</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...cats]
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((c) => (
                            <tr key={c._id}>
                              <td>{c.order ?? 0}</td>
                              <td className="fw-semibold">{c.name}</td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {(c.productIds || []).length} products
                                </span>
                                <div className="text-muted small">
                                  {(c.productIds || [])
                                    .slice(0, 3)
                                    .map((id: any) => productById.get(String(id))?.name)
                                    .filter(Boolean)
                                    .join(', ')}
                                  {(c.productIds || []).length > 3 ? '...' : ''}
                                </div>
                              </td>
                              <td>
                                <button
                                  className={`btn btn-sm ${c.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
                                  onClick={() => toggleStatus(c)}
                                >
                                  {c.status === 'active' ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="text-end">
                                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(c)}>
                                  <i className="bx bx-edit"></i>
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c)}>
                                  <i className="bx bx-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
