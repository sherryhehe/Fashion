'use client';

import Layout from '@/components/layout/Layout';
import { getApiUrl } from '@/utils/apiHelper';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${getApiUrl()}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile({
        name: data.data.name || '',
        email: data.data.email || '',
        phone: data.data.phone || '',
        avatar: data.data.avatar || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${getApiUrl()}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="My Profile">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="My Profile">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Profile Settings</h4>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Profile Avatar */}
                  <div className="col-12 mb-4 text-center">
                    <div className="avatar-xl mx-auto mb-3">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt="Avatar" 
                          className="rounded-circle img-thumbnail"
                          style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="avatar-title rounded-circle bg-primary text-white"
                          style={{ width: '120px', height: '120px', fontSize: '48px', lineHeight: '120px' }}
                        >
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Full Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={profile.email}
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  {/* Phone */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  {/* Role (Read-only) */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      id="role"
                      value="Administrator"
                      disabled
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="mdi mdi-content-save me-1"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={fetchProfile}
                  >
                    <i className="mdi mdi-refresh me-1"></i>
                    Reset
                  </button>
                </div>
              </form>

              {/* Change Password Section */}
              <hr className="my-4" />
              
              <div className="mt-4">
                <h5 className="mb-3">Change Password</h5>
                <p className="text-muted">Want to change your password?</p>
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={() => window.location.href = '/settings'}
                >
                  <i className="mdi mdi-lock-reset me-1"></i>
                  Go to Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
