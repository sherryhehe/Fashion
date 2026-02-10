'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem, SubMenuItem, SidebarProps } from '@/types';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar({ className = '' }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { closeSidebar } = useSidebar();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboards',
      label: 'Dashboards',
      icon: 'solar:widget-5-bold-duotone',
      children: [
        { id: 'main-analytics', label: 'Main Analytics', href: '/' },
        { id: 'finance', label: 'Finance', href: '/dashboard-finance' },
        { id: 'sales', label: 'Sales', href: '/dashboard-sales' },
        { id: 'user-location', label: 'User Location', href: '/dashboard-user-location' },
      ]
    },
    {
      id: 'products',
      label: 'Products',
      icon: 'solar:t-shirt-bold-duotone',
      children: [
        { id: 'product-list', label: 'List', href: '/product-list' },
        { id: 'product-grid', label: 'Grid', href: '/product-grid' },
        { id: 'product-add', label: 'Create', href: '/product-add' },
        { id: 'featured-products', label: 'Featured Products', href: '/featured-products' },
        { id: 'top-selling-products', label: 'Top Selling Products', href: '/top-selling-products' },
      ]
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: 'solar:clipboard-list-bold-duotone',
      children: [
        { id: 'category-list', label: 'Category List', href: '/category-list' },
        { id: 'category-add', label: 'Add Category', href: '/category-add' },
      ]
    },
    {
      id: 'styles',
      label: 'Styles',
      icon: 'solar:palette-bold-duotone',
      children: [
        { id: 'styles-list', label: 'List', href: '/styles-list' },
        { id: 'style-add', label: 'Create', href: '/style-add' },
      ]
    },
    {
      id: 'brands',
      label: 'Brands',
      icon: 'solar:shop-bold-duotone',
      children: [
        { id: 'brand-list', label: 'List', href: '/brand-list' },
        { id: 'brand-add', label: 'Create', href: '/brand-add' },
        { id: 'top-brands', label: 'Top Brands', href: '/top-brands' },
        { id: 'featured-brands', label: 'Featured Brands', href: '/featured-brands' },
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: 'solar:bag-smile-bold-duotone',
      children: [
        { id: 'orders-list', label: 'List', href: '/orders-list' },
        { id: 'recent-orders', label: 'Recent Orders', href: '/recent-orders' },
        { id: 'order-detail', label: 'Details', href: '/order-detail' },
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: 'solar:users-group-two-rounded-bold-duotone',
      children: [
        { id: 'customer-list', label: 'List', href: '/customer-list' },
        { id: 'customer-detail', label: 'Details', href: '/customer-detail' },
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'solar:bell-bing-bold-duotone',
      children: [
        { id: 'notification-list', label: 'All Notifications', href: '/notification-list' },
        { id: 'notification-create', label: 'Create Notification', href: '/notification-create' },
        { id: 'notification-history', label: 'Notification History', href: '/notification-history' },
      ]
    },
    {
      id: 'others',
      label: 'Others',
      icon: 'solar:widget-4-bold-duotone',
      children: [
        { id: 'banner-control', label: 'Banner Control', href: '/banner-control' },
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'solar:settings-bold-duotone',
      href: '/settings'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'solar:chat-square-like-bold-duotone',
      href: '/pages-profile'
    }
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    const isMobile = window.innerWidth <= 1140;
    if (isMobile) {
      closeSidebar();
    }
  };

  // Prevent menu collapse when clicking on child items
  const handleChildClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Close sidebar on route change (mobile) - but not on initial mount
  const prevPathnameRef = useRef(pathname);
  
  useEffect(() => {
    // Only close if pathname actually changed (not on initial mount)
    if (prevPathnameRef.current !== pathname) {
      const isMobile = window.innerWidth <= 1140;
      if (isMobile) {
        closeSidebar();
      }
      prevPathnameRef.current = pathname;
    }
  }, [pathname, closeSidebar]);

  // Prevent Bootstrap collapse from interfering with our custom state
  useEffect(() => {
    const handleBootstrapCollapse = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('.main-nav')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Listen for Bootstrap collapse events and prevent them
    document.addEventListener('show.bs.collapse', handleBootstrapCollapse, true);
    document.addEventListener('hide.bs.collapse', handleBootstrapCollapse, true);
    document.addEventListener('shown.bs.collapse', handleBootstrapCollapse, true);
    document.addEventListener('hidden.bs.collapse', handleBootstrapCollapse, true);

    return () => {
      document.removeEventListener('show.bs.collapse', handleBootstrapCollapse, true);
      document.removeEventListener('hide.bs.collapse', handleBootstrapCollapse, true);
      document.removeEventListener('shown.bs.collapse', handleBootstrapCollapse, true);
      document.removeEventListener('hidden.bs.collapse', handleBootstrapCollapse, true);
    };
  }, []);

  const isMenuExpanded = (menuId: string) => expandedMenus.includes(menuId);

  const renderMenuItem = (item: MenuItem) => {
    if (item.href) {
      // Single menu item with direct link
      return (
        <li key={item.id} className="nav-item">
          <Link 
            className="nav-link d-flex align-items-center" 
            href={item.href}
            onClick={handleLinkClick}
          >
            <span className="nav-icon">
              <iconify-icon icon={item.icon}></iconify-icon>
            </span>
            <span className="nav-text">{item.label}</span>
          </Link>
        </li>
      );
    }

    // Menu item with children (dropdown)
    return (
      <li key={item.id} className="nav-item">
        <button 
          className="nav-link menu-arrow d-flex align-items-center w-100 text-start" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu(item.id);
          }}
          type="button"
          aria-expanded={isMenuExpanded(item.id)}
          aria-controls={`sidebar-${item.id}`}
          data-bs-toggle=""
          data-bs-target=""
        >
          <span className="nav-icon">
            <iconify-icon icon={item.icon}></iconify-icon>
          </span>
          <span className="nav-text">{item.label}</span>
        </button>
        <div 
          className={`collapse ${isMenuExpanded(item.id) ? 'show' : ''}`} 
          id={`sidebar-${item.id}`}
          data-bs-parent=""
          style={{ 
            display: isMenuExpanded(item.id) ? 'block' : 'none',
            visibility: isMenuExpanded(item.id) ? 'visible' : 'hidden',
            opacity: isMenuExpanded(item.id) ? 1 : 0,
            transition: 'all 0.3s ease'
          }}
        >
          <ul className="nav sub-navbar-nav" style={{ display: 'block' }} onClick={handleChildClick}>
            {item.children?.map((child) => (
              <li key={child.id} className="sub-nav-item" style={{ display: 'block' }}>
                <Link 
                  className="sub-nav-link" 
                  href={child.href || '#'}
                  style={{ display: 'block' }}
                  onClick={(e) => {
                    handleChildClick(e);
                    handleLinkClick();
                  }}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  };

  return (
    <div className={`main-nav ${className}`}>
      {/* Sidebar Logo */}
      <div className="logo-box p-4">
        <Link href="/" className="logo-dark">
          <img src="/assets/images/logo-dark.png" className="logo-lg" alt="logo dark" />
        </Link>
        <Link href="/" className="logo-light">
          <img src="/assets/images/logo-light.png" className="logo-lg" alt="logo light" />
        </Link>
      </div>

    
      {/* Navigation Menu */}
      <div className="scrollbar" data-simplebar>
        <ul className="navbar-nav" id="navbar-nav">
          <li className="menu-title">General</li>
          {menuItems.slice(0, 6).map(renderMenuItem)}
          
          <li className="menu-title mt-2">Users</li>
          {menuItems.slice(6, 9).map(renderMenuItem)}
          
          <li className="menu-title mt-2">Other</li>
          {menuItems.slice(9).map(renderMenuItem)}
        </ul>
      </div>
    </div>
  );
}