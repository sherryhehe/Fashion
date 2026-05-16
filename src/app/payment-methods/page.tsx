'use client';

import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { paymentMethodsApi } from '@/lib/api';

interface PaymentMethod {
  _id: string;
  name: string;
  instructions: string;
  isActive: boolean;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', instructions: '', isActive: true });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await paymentMethodsApi.getAll();
      setMethods(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', instructions: '', isActive: true });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (m: PaymentMethod) => {
    setEditingId(m._id);
    setForm({ name: m.name, instructions: m.instructions, isActive: m.isActive });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', instructions: '', isActive: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.instructions.trim()) { setError('Instructions are required'); return; }

    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await paymentMethodsApi.update(editingId, form);
        setSuccess('Payment method updated');
      } else {
        await paymentMethodsApi.create(form);
        setSuccess('Payment method created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', instructions: '', isActive: true });
      await fetchMethods();
    } catch (e: any) {
      setError(e?.message || 'Failed to save payment method');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete payment method "${name}"? Brands using it will lose this option.`)) return;
    setDeleting(id);
    setError('');
    try {
      await paymentMethodsApi.delete(id);
      setSuccess('Payment method deleted');
      await fetchMethods();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (m: PaymentMethod) => {
    try {
      await paymentMethodsApi.update(m._id, { isActive: !m.isActive });
      await fetchMethods();
    } catch (e: any) {
      setError(e?.message || 'Failed to update');
    }
  };

  return (
    <Layout pageTitle="Payment Methods">
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="page-title mb-1">Payment Methods</h4>
              <p className="text-muted mb-0">Create custom payment options that appear in the app. Brands can enable or disable these.</p>
            </div>
            {!showForm && (
              <button className="btn btn-primary" onClick={openCreate}>
                <i className="bx bx-plus me-1"></i>Add Payment Method
              </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-danger alert-dismissible" role="alert">{error}<button type="button" className="btn-close" onClick={() => setError('')}></button></div>}
        {success && <div className="alert alert-success alert-dismissible" role="alert">{success}<button type="button" className="btn-close" onClick={() => setSuccess('')}></button></div>}

        {showForm && (
          <div className="row mb-4">
            <div className="col-lg-8">
              <div className="card border-primary">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">{editingId ? 'Edit Payment Method' : 'New Payment Method'}</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Payment Method Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Bank Transfer, EasyPaisa, JazzCash"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Instructions for Customers <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        rows={5}
                        placeholder="Provide detailed payment instructions that customers will read before placing their order. Include account numbers, steps, or any relevant details."
                        value={form.instructions}
                        onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                        required
                      />
                      <div className="form-text">This text is shown to customers in the app when they select this payment method.</div>
                    </div>
                    <div className="mb-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActive"
                          checked={form.isActive}
                          onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                        />
                        <label className="form-check-label" htmlFor="isActive">Active (visible to brands and customers)</label>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="bx bx-save me-1"></i>{editingId ? 'Update' : 'Create'}</>}
                      </button>
                      <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-2 text-muted">Loading payment methods...</p>
                  </div>
                ) : methods.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bx bx-credit-card" style={{ fontSize: '48px', color: '#ccc' }}></i>
                    <h5 className="mt-3 text-muted">No payment methods yet</h5>
                    <p className="text-muted">Create your first custom payment method to offer brands and customers.</p>
                    <button className="btn btn-primary" onClick={openCreate}>
                      <i className="bx bx-plus me-1"></i>Add Payment Method
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Instructions Preview</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {methods.map(m => (
                          <tr key={m._id}>
                            <td>
                              <strong>{m.name}</strong>
                            </td>
                            <td style={{ maxWidth: '400px' }}>
                              <span className="text-muted" style={{ fontSize: '13px' }}>
                                {m.instructions.length > 120 ? m.instructions.slice(0, 120) + '...' : m.instructions}
                              </span>
                            </td>
                            <td>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={m.isActive}
                                  onChange={() => handleToggleActive(m)}
                                />
                                <label className="form-check-label">
                                  <span className={`badge ${m.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                    {m.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </label>
                              </div>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => openEdit(m)}
                              >
                                <i className="bx bx-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(m._id, m.name)}
                                disabled={deleting === m._id}
                              >
                                {deleting === m._id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bx bx-trash"></i>}
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
