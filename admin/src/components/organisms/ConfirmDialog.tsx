'use client';

import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantClasses = {
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-primary',
  };

  const headerBgClass =
    variant === 'danger' ? 'bg-danger' : variant === 'warning' ? 'bg-warning' : 'bg-primary';

  const headerTextClass = variant === 'warning' ? 'text-dark' : 'text-white';

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onCancel}
        style={{ zIndex: 1040 }}
      />

      {/* Dialog */}
      <div
        className="modal fade show"
        style={{ display: 'block', zIndex: 1050 }}
        tabIndex={-1}
        role="dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onCancel();
          }
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className={`modal-header ${headerBgClass} ${headerTextClass}`}>
              <h5 className="modal-title d-flex align-items-center">
                <i className="mdi mdi-alert-circle-outline me-2"></i>
                {title}
              </h5>
              <button
                type="button"
                className={`btn-close ${variant === 'warning' ? '' : 'btn-close-white'}`}
                onClick={onCancel}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn ${variantClasses[variant]}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

