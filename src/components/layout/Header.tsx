'use client';

import { useEffect } from 'react';
import { BurgerMenu } from '@/components/molecules';

interface HeaderProps {
  pageTitle: string;
}

export default function Header({ pageTitle }: HeaderProps) {
  useEffect(() => {
    // Initialize theme toggle functionality
    const themeColorToggle = document.getElementById('light-dark-mode');
    if (themeColorToggle) {
      const handleThemeToggle = () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-bs-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Store theme preference in localStorage
        localStorage.setItem('theme', newTheme);
        
        // Dispatch global theme change event
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
    <header className="topbar">
      <div className="container-fluid">
        <div className="navbar-header">
          <div className="d-flex align-items-center">
            {/* Menu Toggle Button */}
            <div className="topbar-item">
              <BurgerMenu />
            </div>

            {/* Menu Toggle Button */}
            <div className="topbar-item">
              <h4 className="fw-bold topbar-button pe-none text-uppercase mb-0">{pageTitle}</h4>
            </div>
          </div>

          <div className="d-flex align-items-center gap-1">
            {/* Theme Color (Light/Dark) */}
            <div className="topbar-item">
              <button type="button" className="topbar-button" id="light-dark-mode">
                <iconify-icon icon="solar:moon-bold-duotone" className="fs-24 align-middle"></iconify-icon>
              </button>
            </div>

            {/* Notification */}
            <div className="dropdown topbar-item">
              <button type="button" className="topbar-button position-relative" id="page-header-notifications-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <iconify-icon icon="solar:bell-bing-bold-duotone" className="fs-24 align-middle"></iconify-icon>
                <span className="position-absolute topbar-badge fs-10 translate-middle badge bg-secondary rounded-pill">0<span className="visually-hidden">unread messages</span></span>
              </button>
              <div className="dropdown-menu py-0 dropdown-lg dropdown-menu-end" aria-labelledby="page-header-notifications-dropdown">
                <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
                  <div className="row align-items-center">
                    <div className="col">
                      <h6 className="m-0 fs-16 fw-semibold"> Notifications</h6>
                    </div>
                  </div>
                </div>
                <div className="text-center py-5">
                  <iconify-icon icon="solar:bell-off-bold-duotone" className="fs-48 text-muted"></iconify-icon>
                  <p className="text-muted mt-2 mb-0">No notifications</p>
                  <small className="text-muted">You're all caught up!</small>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="topbar-item d-none d-md-flex">
              <button type="button" className="topbar-button" id="theme-settings-btn" data-bs-toggle="offcanvas" data-bs-target="#theme-settings-offcanvas" aria-controls="theme-settings-offcanvas">
                <iconify-icon icon="solar:settings-bold-duotone" className="fs-24 align-middle"></iconify-icon>
              </button>
            </div>

            {/* Profile */}
            <div className="dropdown topbar-item">
              <button type="button" className="topbar-button" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span className="d-flex align-items-center">
                  <img className="rounded-circle" width="32" src="/assets/images/users/avatar-1.jpg" alt="avatar" />
                </span>
              </button>
              <div className="dropdown-menu dropdown-menu-end">
                <h6 className="dropdown-header">Welcome Admin!</h6>
                <a className="dropdown-item" href="/pages-profile">
                  <i className="bx bx-user-circle text-muted fs-18 align-middle me-1"></i><span className="align-middle">Profile</span>
                </a>
                <a className="dropdown-item" href="/settings">
                  <i className="bx bx-cog text-muted fs-18 align-middle me-1"></i><span className="align-middle">Settings</span>
                </a>
                <div className="dropdown-divider my-1"></div>
                <a 
                  className="dropdown-item text-danger" 
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                >
                  <i className="bx bx-log-out fs-18 align-middle me-1"></i><span className="align-middle">Logout</span>
                </a>
              </div>
            </div>

            {/* Search */}
            <form className="app-search d-none d-md-block ms-2">
              <div className="position-relative">
                <input type="search" className="form-control" placeholder="Search..." autoComplete="off" />
                <iconify-icon icon="solar:magnifer-linear" className="search-widget-icon position-absolute top-50 end-0 translate-middle-y me-3"></iconify-icon>
              </div>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}