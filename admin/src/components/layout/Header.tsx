'use client';

import { useEffect } from 'react';
import { GlobalSearch } from '@/components/molecules';
import { useSidebar } from '@/contexts/SidebarContext';

interface HeaderProps {
  pageTitle: string;
}

export default function Header({ pageTitle }: HeaderProps) {
  const { isOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    // Initialize theme toggle functionality
    const themeColorToggle = document.getElementById('light-dark-mode');
    if (themeColorToggle) {
      const handleThemeToggle = () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-bs-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        localStorage.setItem('theme', newTheme);
        
        const themeChangeEvent = new CustomEvent('themeChange', {
          detail: { theme: newTheme }
        });
        window.dispatchEvent(themeChangeEvent);
      };

      themeColorToggle.addEventListener('click', handleThemeToggle);
      return () => {
        themeColorToggle.removeEventListener('click', handleThemeToggle);
      };
    }
  }, []);

  return (
    <header 
      className="topbar" 
      style={{ 
        height: '70px',
        borderBottom: '1px solid var(--bs-border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 1005,
        width: '100%',
        left: 0,
        right: 0,
        margin: 0,
        padding: 0
      }}
    >
      <div 
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          margin: 0
        }}
      >
        {/* Left Section: Sidebar Toggle & Page Title */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            flex: '0 1 auto',
            minWidth: 0
          }}
        >
          {/* Sidebar Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            style={{
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              color: '#1f2937',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <iconify-icon 
              icon="solar:sidebar-minimalistic-bold-duotone" 
              className="fs-22"
              style={{ 
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: 'transform 0.3s ease' 
              }}
            ></iconify-icon>
          </button>

          {/* Page Title */}
          <h4 
            style={{ 
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1f2937',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '400px',
              margin: 0
            }}
          >
            {pageTitle}
          </h4>
        </div>

        {/* Right Section: Search, Actions & Profile */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            flex: '0 0 auto'
          }}
        >
          {/* Global Search - Desktop */}
          <div 
            className="d-none d-lg-flex" 
            style={{ 
              minWidth: '300px', 
              maxWidth: '450px' 
            }}
          >
            <GlobalSearch />
          </div>

          {/* Theme Toggle */}
          <button 
            type="button" 
            id="light-dark-mode"
            title="Toggle Theme"
            style={{
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              color: '#1f2937',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <iconify-icon icon="solar:moon-bold-duotone" className="fs-20"></iconify-icon>
          </button>

          {/* Notifications */}
          <div className="dropdown">
            <button 
              type="button" 
              className="position-relative"
              id="page-header-notifications-dropdown" 
              data-bs-toggle="dropdown" 
              aria-haspopup="true" 
              aria-expanded="false"
              title="Notifications"
              style={{
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                color: '#1f2937',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                padding: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <iconify-icon icon="solar:bell-bing-bold-duotone" className="fs-20"></iconify-icon>
              <span 
                className="position-absolute badge bg-danger rounded-pill" 
                style={{ 
                  fontSize: '10px', 
                  padding: '2px 5px',
                  top: '4px',
                  right: '4px'
                }}
              >
                0
              </span>
            </button>
            <div 
              className="dropdown-menu dropdown-menu-end shadow-sm" 
              style={{ minWidth: '320px' }} 
              aria-labelledby="page-header-notifications-dropdown"
            >
              <div className="p-3 border-bottom">
                <h6 className="mb-0 fw-semibold">Notifications</h6>
              </div>
              <div className="text-center py-5">
                <iconify-icon icon="solar:bell-off-bold-duotone" className="fs-48 text-muted"></iconify-icon>
                <p className="text-muted mt-2 mb-0">No notifications</p>
                <small className="text-muted">You're all caught up!</small>
              </div>
            </div>
          </div>

          {/* Settings */}
          <button 
            type="button" 
            className="d-none d-md-flex"
            id="theme-settings-btn" 
            data-bs-toggle="offcanvas" 
            data-bs-target="#theme-settings-offcanvas" 
            aria-controls="theme-settings-offcanvas"
            title="Settings"
            style={{
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              color: '#1f2937',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <iconify-icon icon="solar:settings-bold-duotone" className="fs-20"></iconify-icon>
          </button>

          {/* Profile Dropdown */}
          <div className="dropdown">
            <button 
              type="button" 
              id="page-header-user-dropdown" 
              data-bs-toggle="dropdown" 
              aria-haspopup="true" 
              aria-expanded="false"
              title="User Menu"
              style={{
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                padding: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <img 
                className="rounded-circle" 
                width="36" 
                height="36"
                src="/assets/images/users/avatar-1.jpg" 
                alt="avatar"
                style={{ 
                  objectFit: 'cover', 
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              />
            </button>
            <div 
              className="dropdown-menu dropdown-menu-end shadow-sm" 
              style={{ minWidth: '220px' }}
            >
              <div className="dropdown-header d-flex align-items-center gap-2 pb-2">
                <img 
                  className="rounded-circle" 
                  width="40" 
                  height="40"
                  src="/assets/images/users/avatar-1.jpg" 
                  alt="avatar"
                  style={{ objectFit: 'cover' }}
                />
                <div>
                  <h6 className="mb-0 fw-semibold">Admin User</h6>
                  <small className="text-muted">Administrator</small>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item py-2" href="/pages-profile">
                <i className="bx bx-user-circle text-muted fs-18 align-middle me-2"></i>
                <span className="align-middle">Profile</span>
              </a>
              <a className="dropdown-item py-2" href="/settings">
                <i className="bx bx-cog text-muted fs-18 align-middle me-2"></i>
                <span className="align-middle">Settings</span>
              </a>
              <div className="dropdown-divider my-1"></div>
              <a 
                className="dropdown-item py-2 text-danger" 
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
              >
                <i className="bx bx-log-out fs-18 align-middle me-2"></i>
                <span className="align-middle">Logout</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div 
        className="d-lg-none" 
        style={{ 
          padding: '0 1.5rem 1rem 1.5rem',
          marginTop: '0.5rem'
        }}
      >
        <GlobalSearch />
      </div>
    </header>
  );
}
