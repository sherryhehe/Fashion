'use client';

import { InteractiveButton } from '@/components/atoms';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="text-center">
        <div className="mb-4">
          <iconify-icon 
            icon="solar:file-remove-bold-duotone" 
            className="text-warning"
            style={{ fontSize: '5rem' }}
          ></iconify-icon>
        </div>
        <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
        <h2 className="mb-3">Page Not Found</h2>
        <p className="text-muted mb-4 fs-5">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <InteractiveButton variant="primary" size="lg">
            <i className="bx bx-home me-2"></i>Back to Home
          </InteractiveButton>
        </Link>
      </div>
    </div>
  );
}

