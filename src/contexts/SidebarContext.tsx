'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = () => {
    const html = document.documentElement;
    const isMobile = window.innerWidth <= 1140;
    
    if (isMobile) {
      // On mobile, use overlay approach
      html.classList.add('sidebar-enable');
      document.body.classList.add('sidebar-open');
      html.setAttribute('data-menu-size', 'hidden');
      showBackdrop();
    } else {
      // On desktop, change from condensed to default
      html.setAttribute('data-menu-size', 'default');
    }
    setIsOpen(true);
  };

  const closeSidebar = () => {
    const html = document.documentElement;
    const isMobile = window.innerWidth <= 1140;
    
    if (isMobile) {
      // On mobile, remove overlay
      html.classList.remove('sidebar-enable');
      document.body.classList.remove('sidebar-open');
      html.setAttribute('data-menu-size', 'hidden');
      // Use setTimeout to allow animation to complete
      setTimeout(() => {
        hideBackdrop();
      }, 150);
    } else {
      // On desktop, change from default to condensed
      html.setAttribute('data-menu-size', 'condensed');
    }
    setIsOpen(false);
  };

  const toggleSidebar = () => {
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  const showBackdrop = () => {
    // Remove any existing backdrop first
    const existingBackdrop = document.querySelector('.offcanvas-backdrop');
    if (existingBackdrop) {
      document.body.removeChild(existingBackdrop);
    }

    const backdrop = document.createElement('div');
    backdrop.classList.add('offcanvas-backdrop');
    document.body.appendChild(backdrop);
    
    // Add show class after a small delay for animation
    setTimeout(() => {
      backdrop.classList.add('show');
    }, 10);
    
    document.body.style.overflow = 'hidden';
    
    // Only add padding-right on desktop
    if (window.innerWidth > 1040) {
      document.body.style.paddingRight = '15px';
    }
    
    // Close sidebar when backdrop is clicked - add delay to prevent immediate triggering
    setTimeout(() => {
      backdrop.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
      });
    }, 200); // Delay backdrop click handler
    
    // Close on escape key
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSidebar();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  };

  const hideBackdrop = () => {
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');
    backdrops.forEach(backdrop => {
      if (backdrop && document.body.contains(backdrop)) {
        backdrop.classList.remove('show');
        setTimeout(() => {
          if (backdrop.parentNode === document.body) {
            document.body.removeChild(backdrop);
          }
        }, 150);
      }
    });
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  // Handle window resize with debouncing
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const html = document.documentElement;
        const isMobile = window.innerWidth <= 1140;
        
        if (!isMobile && isOpen) {
          // Switching to desktop - remove mobile overlay and use desktop mode
          html.classList.remove('sidebar-enable');
          document.body.classList.remove('sidebar-open');
          hideBackdrop();
          html.setAttribute('data-menu-size', 'default');
        } else if (isMobile && isOpen) {
          // Switching to mobile - remove desktop mode and use mobile overlay
          html.setAttribute('data-menu-size', 'hidden');
          html.classList.add('sidebar-enable');
          document.body.classList.add('sidebar-open');
          showBackdrop();
        } else if (isMobile && !isOpen) {
          // Ensure clean state on mobile when closed
          html.classList.remove('sidebar-enable');
          document.body.classList.remove('sidebar-open');
          html.setAttribute('data-menu-size', 'hidden');
          hideBackdrop();
        }
      }, 150); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Check initial state on mount
  useEffect(() => {
    const html = document.documentElement;
    const isMobile = window.innerWidth <= 1140;
    
    if (isMobile) {
      // On mobile, set initial closed state
      setIsOpen(false);
      html.setAttribute('data-menu-size', 'hidden');
      html.classList.remove('sidebar-enable');
      document.body.classList.remove('sidebar-open');
      // Clean up any leftover backdrops
      const backdrops = document.querySelectorAll('.offcanvas-backdrop');
      backdrops.forEach(backdrop => {
        if (backdrop.parentNode === document.body) {
          document.body.removeChild(backdrop);
        }
      });
    } else {
      // On desktop, check if sidebar is in default mode (expanded)
      const menuSize = html.getAttribute('data-menu-size');
      setIsOpen(menuSize === 'default');
      // Ensure no mobile classes on desktop
      document.body.classList.remove('sidebar-open');
    }
  }, []);

  return (
    <SidebarContext.Provider 
      value={{ 
        isOpen, 
        toggleSidebar, 
        openSidebar, 
        closeSidebar 
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
