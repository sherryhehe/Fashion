'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if we're in the browser (client-side)
        if (typeof window === 'undefined') {
          setIsChecking(false);
          setShouldRender(true);
          return;
        }

        const token = localStorage.getItem('token');
        // Normalize pathname by removing trailing slash
        const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
          ? pathname.slice(0, -1) 
          : pathname;
        
        const publicRoutes = ['/login'];
        const isPublicRoute = publicRoutes.includes(normalizedPath);

        if (!token && !isPublicRoute) {
          // Redirect to login if not authenticated
          router.replace('/login');
          setShouldRender(false);
        } else if (token && isPublicRoute) {
          // Redirect to dashboard if already authenticated and on login page
          router.replace('/');
          setShouldRender(false);
        } else {
          // User is on the correct page
          setShouldRender(true);
        }
        
        // Always stop loading after check
        setIsChecking(false);
      } catch (error) {
        console.error('AuthCheck error:', error);
        setIsChecking(false);
        setShouldRender(true); // Show page on error
      }
    };

    // Small delay to ensure client-side hydration is complete
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router, pathname]);

  // Show loading screen while checking authentication
  if (isChecking) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff6c2f 0%, #ef5f5f 100%)',
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-white" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-white mt-3 fw-semibold">Loading Shopo Admin...</p>
        </div>
      </div>
    );
  }

  // Don't render children if we're redirecting
  if (!shouldRender) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white'
      }} />
    );
  }

  return <>{children}</>;
}

