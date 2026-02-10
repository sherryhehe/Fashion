'use client';

import React from 'react';

interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline-primary' | 'outline-secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function InteractiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button'
}: InteractiveButtonProps) {
  const handleClick = () => {
    if (disabled || loading) return;
    
    if (onClick) {
      onClick();
    }
  };

  const getVariantClass = () => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      success: 'btn-success',
      danger: 'btn-danger',
      warning: 'btn-warning',
      info: 'btn-info',
      'outline-primary': 'btn-outline-primary',
      'outline-secondary': 'btn-outline-secondary'
    };
    return variants[variant] || 'btn-primary';
  };

  const getSizeClass = () => {
    const sizes = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg'
    };
    return sizes[size] || '';
  };

  return (
    <button
      type={type}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      )}
      {children}
    </button>
  );
}
