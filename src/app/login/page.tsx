'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        router.push('/');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect. Ensure backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Left Side - Branding */}
          <div className="col-xl-9">
            <div className="row">
              <div className="col-md-7 mx-auto">
                <div className="mb-0 border-0 p-md-5 p-lg-0 p-4">
                  <div className="mb-4 p-0">
                    <a href="/" className="d-block auth-logo">
                      <span className="logo-lg">
                        <span className="d-flex align-items-center gap-2">
                          <span className="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
                            </svg>
                          </span>
                          <span className="logo-text fs-4 fw-bold text-dark">Larkon Fashion</span>
                        </span>
                      </span>
                    </a>
                  </div>

                  <div className="my-auto overflow-hidden">
                    <div className="text-center">
                      <h4 className="fs-20 fw-semibold mb-2">Welcome Back</h4>
                      <p className="text-muted mb-4">Sign in to access your admin dashboard</p>
                    </div>

                    {/* Login Form */}
                    <div className="card shadow-none border-0">
                      <div className="card-body p-0">
                        <form onSubmit={handleLogin} className="needs-validation" noValidate>
                          {error && (
                            <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                              <i className="mdi mdi-alert-circle me-2"></i>
                              {error}
                            </div>
                          )}

                          {/* Email */}
                          <div className="mb-3">
                            <label htmlFor="email" className="form-label fs-13 fw-medium">
                              Email Address
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <i className="mdi mdi-email-outline"></i>
                              </span>
                              <input
                                type="email"
                                className="form-control border-start-0 ps-0"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          {/* Password */}
                          <div className="mb-3">
                            <label htmlFor="password" className="form-label fs-13 fw-medium">
                              Password
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <i className="mdi mdi-lock-outline"></i>
                              </span>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control border-start-0 border-end-0 ps-0"
                                id="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                              />
                              <span 
                                className="input-group-text bg-light border-start-0 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                <i className={`mdi ${showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'}`}></i>
                              </span>
                            </div>
                          </div>

                          {/* Remember & Forgot */}
                          <div className="mb-3">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="rememberMe"
                              />
                              <label className="form-check-label fs-13" htmlFor="rememberMe">
                                Remember me
                              </label>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="mb-3">
                            <button
                              className="btn btn-primary w-100"
                              type="submit"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Signing in...
                                </>
                              ) : (
                                <>
                                  <i className="mdi mdi-login me-1"></i>
                                  Sign In
                                </>
                              )}
                            </button>
                          </div>
                        </form>

                        {/* Demo Credentials */}
                        <div className="alert alert-info border-0 mb-0" role="alert">
                          <div className="d-flex align-items-center">
                            <i className="mdi mdi-information-outline fs-20 me-2"></i>
                            <div className="flex-grow-1">
                              <h6 className="alert-heading fs-13 mb-1 fw-semibold">Demo Credentials</h6>
                              <p className="mb-0 fs-12">
                                <strong>Email:</strong> admin@larkon.com<br />
                                <strong>Password:</strong> admin123
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image/Pattern */}
          <div className="col-xl-3">
            <div className="account-page-bg p-md-5 p-4 d-flex align-items-center justify-content-center" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minHeight: '100vh'
            }}>
              <div className="text-center text-white-50">
                <div className="mb-4">
                  <i className="mdi mdi-shopping" style={{ fontSize: '80px', color: 'rgba(255,255,255,0.9)' }}></i>
                </div>
                <h4 className="text-white mb-3 fw-semibold">Larkon Admin</h4>
                <p className="text-white-50 mb-0 px-4">
                  Manage your e-commerce store with ease. Track orders, products, and customers all in one place.
                </p>
                <div className="mt-4">
                  <div className="d-flex justify-content-center gap-3 text-white-50 fs-12">
                    <span><i className="mdi mdi-shield-check me-1"></i> Secure</span>
                    <span><i className="mdi mdi-speedometer me-1"></i> Fast</span>
                    <span><i className="mdi mdi-check-circle me-1"></i> Reliable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .account-page {
          min-height: 100vh;
        }
        .account-page-bg {
          position: relative;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .form-control:focus {
          border-color: #6571ff;
          box-shadow: 0 0 0 0.2rem rgba(101, 113, 255, 0.15);
        }
        .input-group-text {
          color: #6c757d;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          padding: 0.5rem 1rem;
          font-weight: 500;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .btn-primary:disabled {
          background: #6c757d;
          opacity: 0.65;
        }
        .alert-info {
          background-color: rgba(13, 202, 240, 0.1);
          color: #055160;
        }
        .form-label {
          color: #495057;
          margin-bottom: 0.375rem;
        }
        .input-group-text {
          transition: all 0.15s ease-in-out;
        }
        .form-control:focus + .input-group-text,
        .input-group-text:has(+ .form-control:focus) {
          border-color: #6571ff;
          background-color: rgba(101, 113, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
