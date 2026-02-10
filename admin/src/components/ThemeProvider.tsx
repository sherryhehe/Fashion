'use client';

import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize theme on page load
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-bs-theme', savedTheme);
      
      // Update theme toggle icon if it exists
      const themeToggle = document.getElementById('light-dark-mode');
      if (themeToggle) {
        const icon = themeToggle.querySelector('iconify-icon');
        if (icon) {
          icon.setAttribute('icon', savedTheme === 'light' ? 'solar:moon-bold-duotone' : 'solar:sun-bold-duotone');
        }
      }
    };

    // Initialize theme immediately
    initializeTheme();

    // Also initialize when DOM is ready (fallback)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeTheme);
    }

    // Listen for theme changes from other components
    const handleThemeChange = (event: CustomEvent) => {
      const newTheme = event.detail.theme;
      document.documentElement.setAttribute('data-bs-theme', newTheme);
      
      // Update theme toggle icon
      const themeToggle = document.getElementById('light-dark-mode');
      if (themeToggle) {
        const icon = themeToggle.querySelector('iconify-icon');
        if (icon) {
          icon.setAttribute('icon', newTheme === 'light' ? 'solar:moon-bold-duotone' : 'solar:sun-bold-duotone');
        }
      }
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);

    return () => {
      document.removeEventListener('DOMContentLoaded', initializeTheme);
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  return <>{children}</>;
}
