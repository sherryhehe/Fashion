'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/apiHelper';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/login`, {
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
      setError('Could not reach the server. Check that the API is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@shopo.com');
    setPassword('admin123');
  };

  return (
    <>
      <div className="login-page">
        {/* Animated Background */}
        <div className="animated-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        {/* Login Container */}
        <div className={`login-container ${mounted ? 'fade-in' : ''}`}>
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-wrapper">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="logo-icon">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6c2f" />
                    <stop offset="100%" stopColor="#ef5f5f" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="brand-name">Shopo</h1>
            <p className="brand-tagline">Fashion Admin Dashboard</p>
          </div>

          {/* Login Card */}
          <div className="login-card">
            <div className="card-header">
              <h2 className="welcome-title">Welcome Back</h2>
              <p className="welcome-subtitle">Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              {error && (
                <div className="error-alert">
                  <i className="mdi mdi-alert-circle"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <i className="mdi mdi-email-outline"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="admin@shopo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <i className="mdi mdi-lock-outline"></i>
                  Password
                </label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={`mdi ${showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'}`}></i>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" id="remember" />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">Remember me</span>
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="mdi mdi-arrow-right"></i>
                  </>
                )}
              </button>

              {/* Demo Credentials */}
              <div className="demo-section">
                <div className="demo-badge">
                  <i className="mdi mdi-information-variant"></i>
                  <span>Demo Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="demo-button"
                >
                  <div className="demo-content">
                    <div className="demo-row">
                      <span className="demo-label">Email:</span>
                      <span className="demo-value">admin@shopo.com</span>
                    </div>
                    <div className="demo-row">
                      <span className="demo-label">Password:</span>
                      <span className="demo-value">admin123</span>
                    </div>
                  </div>
                  <span className="demo-hint">Click to auto-fill</span>
                </button>
              </div>
            </form>
          </div>

          {/* Features */}
          <div className="features">
            <div className="feature-item">
              <i className="mdi mdi-shield-check"></i>
              <span>Secure</span>
            </div>
            <div className="feature-item">
              <i className="mdi mdi-speedometer"></i>
              <span>Fast</span>
            </div>
            <div className="feature-item">
              <i className="mdi mdi-cloud-check"></i>
              <span>Reliable</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Base Styles */
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #ff6c2f 0%, #ef5f5f 100%);
        }

        /* Animated Background */
        .animated-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.5;
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(78, 205, 196, 0.3) 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(255, 193, 7, 0.3) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-50px, 50px) scale(0.9);
          }
        }

        /* Login Container */
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-container.fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Logo Section */
        .logo-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          animation: logoFloat 3s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .logo-icon {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }

        .brand-name {
          font-size: 36px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
          letter-spacing: -0.5px;
        }

        .brand-tagline {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-weight: 500;
        }

        /* Login Card */
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 24px;
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #ff6c2f 0%, #ef5f5f 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-subtitle {
          font-size: 14px;
          color: #718096;
          margin: 0;
        }

        /* Form Styles */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
          color: white;
          border-radius: 12px;
          font-size: 14px;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
        }

        .form-label i {
          font-size: 18px;
          color: #ff6c2f;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          font-size: 15px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #f7fafc;
          color: #2d3748;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input::placeholder {
          color: #a0aec0;
        }

        .form-input:focus {
          background: white;
          border-color: #ff6c2f;
          box-shadow: 0 0 0 4px rgba(255, 108, 47, 0.1);
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper .form-input {
          padding-right: 48px;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
          font-size: 20px;
        }

        .toggle-password:hover {
          color: #ff6c2f;
        }

        /* Form Options */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: -8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkbox-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #cbd5e0;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
          background: linear-gradient(135deg, #ff6c2f 0%, #ef5f5f 100%);
          border-color: #ff6c2f;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
          content: "✓";
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .checkbox-text {
          font-size: 14px;
          color: #4a5568;
        }

        .forgot-link {
          font-size: 14px;
          color: #ff6c2f;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #ef5f5f;
        }

        /* Submit Button */
        .submit-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #ff6c2f 0%, #ef5f5f 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 108, 47, 0.4);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 108, 47, 0.5);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Demo Section */
        .demo-section {
          margin-top: 8px;
        }

        .demo-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, rgba(13, 202, 240, 0.15) 0%, rgba(13, 202, 240, 0.1) 100%);
          color: #0c7792;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .demo-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .demo-button:hover {
          border-color: #ff6c2f;
          background: linear-gradient(135deg, #fff 0%, #f7fafc 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .demo-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 8px;
        }

        .demo-row {
          display: flex;
          gap: 8px;
          font-size: 13px;
        }

        .demo-label {
          font-weight: 600;
          color: #4a5568;
          min-width: 75px;
        }

        .demo-value {
          color: #ff6c2f;
          font-weight: 500;
          font-family: 'Courier New', monospace;
        }

        .demo-hint {
          display: block;
          font-size: 11px;
          color: #a0aec0;
          font-style: italic;
        }

        /* Features */
        .features {
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
        }

        .feature-item i {
          font-size: 18px;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .login-card {
            padding: 32px 24px;
          }

          .welcome-title {
            font-size: 24px;
          }

          .brand-name {
            font-size: 30px;
          }

          .features {
            gap: 16px;
          }

          .feature-item {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}
