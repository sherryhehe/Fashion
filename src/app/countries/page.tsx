'use client';

import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { countriesApi } from '@/lib/api';

interface Country {
  code: string;
  name: string;
  isActive: boolean;
}

const COMMON_COUNTRIES = [
  { code: 'PK', name: 'Pakistan' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'TR', name: 'Turkey' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'EG', name: 'Egypt' },
  { code: 'NG', name: 'Nigeria' },
];

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res = await countriesApi.getEligible();
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (code: string, name: string) => {
    const already = countries.find(c => c.code === code);
    if (already) { setError(`${name} is already in the list`); return; }
    setSaving(true);
    setError('');
    try {
      await countriesApi.add({ code, name });
      setSuccess(`${name} added`);
      await fetchCountries();
    } catch (e: any) {
      setError(e?.message || 'Failed to add country');
    } finally {
      setSaving(false);
    }
  };

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) { setError('Code and name required'); return; }
    const code = form.code.trim().toUpperCase();
    const already = countries.find(c => c.code === code);
    if (already) { setError(`${form.name} is already in the list`); return; }
    setSaving(true);
    setError('');
    try {
      await countriesApi.add({ code, name: form.name.trim() });
      setSuccess(`${form.name} added`);
      setForm({ code: '', name: '' });
      setShowForm(false);
      await fetchCountries();
    } catch (e: any) {
      setError(e?.message || 'Failed to add country');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (c: Country) => {
    try {
      await countriesApi.update(c.code, { isActive: !c.isActive });
      await fetchCountries();
    } catch (e: any) {
      setError(e?.message || 'Failed to update');
    }
  };

  const handleRemove = async (code: string, name: string) => {
    if (!confirm(`Remove "${name}" from eligible countries? Brands targeting this country and users from this country will be affected.`)) return;
    setDeleting(code);
    setError('');
    try {
      await countriesApi.remove(code);
      setSuccess(`${name} removed`);
      await fetchCountries();
    } catch (e: any) {
      setError(e?.message || 'Failed to remove country');
    } finally {
      setDeleting(null);
    }
  };

  const addedCodes = new Set(countries.map(c => c.code));

  return (
    <Layout pageTitle="Eligible Countries">
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-12">
            <h4 className="page-title mb-1">Eligible Countries</h4>
            <p className="text-muted mb-0">
              Manage the countries available on the platform. Users must select a country when registering and will only see products from brands that serve their country. Brands select which countries they ship to.
            </p>
          </div>
        </div>

        {error && <div className="alert alert-danger alert-dismissible" role="alert">{error}<button type="button" className="btn-close" onClick={() => setError('')}></button></div>}
        {success && <div className="alert alert-success alert-dismissible" role="alert">{success}<button type="button" className="btn-close" onClick={() => setSuccess('')}></button></div>}

        <div className="row">
          {/* Active countries list */}
          <div className="col-lg-7">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Active Eligible Countries</h5>
                <span className="badge bg-primary">{countries.length} countries</span>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary"></div>
                  </div>
                ) : countries.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bx bx-globe" style={{ fontSize: '48px', color: '#ccc' }}></i>
                    <p className="text-muted mt-2">No countries added yet. Use the panel on the right to add countries.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Code</th>
                          <th>Country</th>
                          <th>Status</th>
                          <th className="text-end">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {countries.map(c => (
                          <tr key={c.code}>
                            <td><span className="badge bg-light text-dark fw-bold">{c.code}</span></td>
                            <td><strong>{c.name}</strong></td>
                            <td>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={c.isActive}
                                  onChange={() => handleToggleActive(c)}
                                />
                                <label className="form-check-label">
                                  <span className={`badge ${c.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                    {c.isActive ? 'Active' : 'Disabled'}
                                  </span>
                                </label>
                              </div>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemove(c.code, c.name)}
                                disabled={deleting === c.code}
                              >
                                {deleting === c.code ? <span className="spinner-border spinner-border-sm"></span> : <i className="bx bx-trash"></i>}
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

          {/* Add countries panel */}
          <div className="col-lg-5">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Add Countries</h5>
              </div>
              <div className="card-body">
                <p className="text-muted small mb-3">Quick-add common countries:</p>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {COMMON_COUNTRIES.map(c => (
                    <button
                      key={c.code}
                      className={`btn btn-sm ${addedCodes.has(c.code) ? 'btn-success disabled' : 'btn-outline-secondary'}`}
                      onClick={() => handleQuickAdd(c.code, c.name)}
                      disabled={saving || addedCodes.has(c.code)}
                    >
                      {addedCodes.has(c.code) && <i className="bx bx-check me-1"></i>}
                      {c.name}
                    </button>
                  ))}
                </div>

                <hr />

                <p className="text-muted small mb-2">Add a custom country:</p>
                {!showForm ? (
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setShowForm(true)}>
                    <i className="bx bx-plus me-1"></i>Add Custom Country
                  </button>
                ) : (
                  <form onSubmit={handleCustomAdd}>
                    <div className="row g-2 mb-2">
                      <div className="col-4">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Code (e.g. PK)"
                          maxLength={3}
                          value={form.code}
                          onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Country name"
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                        {saving ? <span className="spinner-border spinner-border-sm"></span> : 'Add'}
                      </button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setShowForm(false); setForm({ code: '', name: '' }); }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
