'use client';

import { useEffect } from 'react';
import { InteractiveButton } from '@/components/atoms';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="text-center">
        <div className="mb-4">
          <iconify-icon 
            icon="solar:danger-triangle-bold-duotone" 
            className="text-danger"
            style={{ fontSize: '5rem' }}
          ></iconify-icon>
        </div>
        <h1 className="display-4 fw-bold mb-3">Something went wrong!</h1>
        <p className="text-muted mb-4 fs-5">
          We encountered an unexpected error. Please try again.
        </p>
        {error.message && (
          <div className="alert alert-danger mx-auto" style={{ maxWidth: '500px' }}>
            <small className="text-break">{error.message}</small>
          </div>
        )}
        <div className="d-flex gap-2 justify-content-center">
          <InteractiveButton
            onClick={reset}
            variant="primary"
            size="lg"
          >
            <i className="bx bx-refresh me-2"></i>Try Again
          </InteractiveButton>
          <InteractiveButton
            onClick={() => window.location.href = '/'}
            variant="outline-secondary"
            size="lg"
          >
            <i className="bx bx-home me-2"></i>Go Home
          </InteractiveButton>
        </div>
      </div>
    </div>
  );
}

