import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon, 
    iconPosition = 'left',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
      secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary',
      success: 'bg-success text-white hover:bg-success/90 focus:ring-success',
      danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger',
      warning: 'bg-warning text-white hover:bg-warning/90 focus:ring-warning',
      info: 'bg-info text-white hover:bg-info/90 focus:ring-info',
      light: 'bg-light text-dark hover:bg-light/90 focus:ring-light',
      dark: 'bg-dark text-white hover:bg-dark/90 focus:ring-dark',
      'outline-primary': 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
      'outline-secondary': 'border border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-secondary',
      'outline-success': 'border border-success text-success hover:bg-success hover:text-white focus:ring-success',
      'outline-danger': 'border border-danger text-danger hover:bg-danger hover:text-white focus:ring-danger',
      'outline-warning': 'border border-warning text-warning hover:bg-warning hover:text-white focus:ring-warning',
      'outline-info': 'border border-info text-info hover:bg-info hover:text-white focus:ring-info',
      'outline-light': 'border border-light text-light hover:bg-light hover:text-white focus:ring-light',
      'outline-dark': 'border border-dark text-dark hover:bg-dark hover:text-white focus:ring-dark',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
