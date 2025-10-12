'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const publicRoutes = ['/login'];

    if (!token && !publicRoutes.includes(pathname)) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [router, pathname]);

  return <>{children}</>;
}

