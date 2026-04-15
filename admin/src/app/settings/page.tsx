'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  useChangePassword,
  usePaymentSettings,
  useUpdatePaymentSettings,
  useShippingSettings,
  useUpdateShippingSettings,
} from '@/hooks/useApi';
import { useNotificationContext } from '@/contexts/NotificationContext';

export default function Settings() {
  const { data: paymentData, isLoading: paymentLoading } = usePaymentSettings();
  const { data: shippingData, isLoading: shippingLoading } = useShippingSettings();
  const updatePayment = useUpdatePaymentSettings();
  const updateShipping = useUpdateShippingSettings();
  const changePassword = useChangePassword();
  const { addNotification } = useNotificationContext();
  const [paymentCurrency, setPaymentCurrency] = useState<string>('pkr');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [shippingCost, setShippingCost] = useState<string>('100');
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');

  useEffect(() => {
    if (paymentData?.currency) setPaymentCurrency(paymentData.currency);
  }, [paymentData?.currency]);

  useEffect(() => {
    if (shippingData && typeof shippingData.shippingCost === 'number') {
      setShippingCost(String(shippingData.shippingCost));
    }
    if (shippingData?.estimatedDelivery) {
      setEstimatedDelivery(shippingData.estimatedDelivery);
    }
  }, [shippingData]);

  const handleShippingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Number(shippingCost);
    if (!Number.isFinite(cost) || cost < 0) {
      addNotification('error', 'Shipping cost must be a valid number ≥ 0');
      return;
    }
    try {
      await updateShipping.mutateAsync({
        shippingCost: Math.round(cost),
        estimatedDelivery: estimatedDelivery.trim(),
      });
      addNotification('success', 'Shipping settings saved — values apply to new orders and the mobile app');
    } catch (err: any) {
      addNotification('error', err?.message || 'Failed to save');
    }
  };

  const handlePaymentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePayment.mutateAsync({ currency: paymentCurrency });
      addNotification('success', 'Payment settings saved');
    } catch (err: any) {
      addNotification('error', err?.message || 'Failed to save');
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      addNotification('error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      addNotification('error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      addNotification('error', 'New password and confirm password do not match');
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      addNotification('success', 'Admin password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addNotification('error', err?.message || 'Failed to change password');
    }
  };
  return (
    <Layout pageTitle="Settings">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Settings</li>
              </ol>
            </nav>
          </div>
        </div>
        {/* Settings Management */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">General Settings</h4>
                <form>
                  <div className="mb-3">
                    <label className="form-label">Site Name</label>
                    <input type="text" className="form-control" defaultValue="Shopo Admin Dashboard" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Site Description</label>
                    <textarea className="form-control" rows="3" defaultValue="A fully responsive premium admin dashboard template"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Admin Email</label>
                    <input type="email" className="form-control" defaultValue="admin@shopo.com" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Timezone</label>
                    <select className="form-select">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+1 (Central European Time)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="maintenance" defaultChecked />
                      <label className="form-check-label" htmlFor="maintenance">
                        Maintenance Mode
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Security Settings</h4>
                <form onSubmit={handlePasswordSave}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <small className="text-muted">Minimum 6 characters.</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={changePassword.isPending}>
                    {changePassword.isPending ? 'Updating...' : 'Change password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping (mobile + checkout) */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Shipping &amp; delivery</h4>
                <p className="text-muted small">
                  Sets the flat shipping charge added to every order and the estimated delivery message shown in the mobile app (cart and checkout).
                </p>
                {shippingLoading ? (
                  <p className="text-muted">Loading...</p>
                ) : (
                  <form onSubmit={handleShippingSave}>
                    <div className="mb-3">
                      <label className="form-label">Shipping cost (same currency as your store)</label>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="form-control"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                        required
                      />
                      <small className="text-muted">Previously fixed at 100 PKR; now stored in the database.</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Estimated delivery time (shown to customers)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 3–5 business days"
                        value={estimatedDelivery}
                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                        maxLength={200}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={updateShipping.isPending}>
                      {updateShipping.isPending ? 'Saving...' : 'Save shipping settings'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Payment Settings</h4>
                <p className="text-muted small">Configure where payments go. Card payments use Stripe; set <code>STRIPE_SECRET_KEY</code> in backend <code>.env</code> to enable.</p>
                {paymentLoading ? (
                  <p className="text-muted">Loading...</p>
                ) : (
                  <form onSubmit={handlePaymentSave}>
                    <div className="mb-3">
                      <label className="form-label">Stripe status</label>
                      <div className="form-control bg-light">
                        {paymentData?.stripeConfigured ? (
                          <span className="text-success">Configured — payments will go to your Stripe connected account</span>
                        ) : (
                          <span className="text-warning">Not configured — set STRIPE_SECRET_KEY in backend .env</span>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Currency</label>
                      <select
                        className="form-select"
                        value={paymentCurrency}
                        onChange={(e) => setPaymentCurrency(e.target.value)}
                      >
                        <option value="pkr">PKR (Pakistani Rupee)</option>
                        <option value="usd">USD (US Dollar)</option>
                        <option value="eur">EUR (Euro)</option>
                        <option value="gbp">GBP (British Pound)</option>
                        <option value="inr">INR (Indian Rupee)</option>
                      </select>
                      <small className="text-muted">Used for Stripe and display. Save to update.</small>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={updatePayment.isPending}>
                      {updatePayment.isPending ? 'Saving...' : 'Save payment settings'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Notification Settings</h4>
                <form>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="emailnotifications" defaultChecked />
                      <label className="form-check-label" htmlFor="emailnotifications">
                        Email Notifications
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="smsnotifications" />
                      <label className="form-check-label" htmlFor="smsnotifications">
                        SMS Notifications
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="pushnotifications" defaultChecked />
                      <label className="form-check-label" htmlFor="pushnotifications">
                        Push Notifications
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notification Frequency</label>
                    <select className="form-select">
                      <option>Real-time</option>
                      <option>Every 15 minutes</option>
                      <option>Every hour</option>
                      <option>Daily digest</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}