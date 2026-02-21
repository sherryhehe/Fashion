'use client';

import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

interface BurgerMenuProps {
  className?: string;
  iconClassName?: string;
}

export default function BurgerMenu({ 
  className = '', 
  iconClassName = 'fs-24 align-middle' 
}: BurgerMenuProps) {
  const { isOpen, toggleSidebar } = useSidebar();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const button = buttonRef.current;
    if (!button) return;

    let touchStartTime = 0;
    let touchMoved = false;

    // Touch event handler for mobile
    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now();
      touchMoved = false;
      e.stopPropagation();
    };

    const handleTouchMove = () => {
      touchMoved = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchDuration = Date.now() - touchStartTime;
      if (!touchMoved && touchDuration < 500) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleSidebar();
      }
    };

    // Click handler for desktop
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleSidebar();
      return false;
    };

    // Add touch handlers for mobile (with capture and passive: false to allow preventDefault)
    button.addEventListener('touchstart', handleTouchStart, { capture: true, passive: false });
    button.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
    button.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
    
    // Add click handler for desktop
    button.addEventListener('click', handleClick, { capture: true });

    return () => {
      button.removeEventListener('touchstart', handleTouchStart, { capture: true });
      button.removeEventListener('touchmove', handleTouchMove, { capture: true });
      button.removeEventListener('touchend', handleTouchEnd, { capture: true });
      button.removeEventListener('click', handleClick, { capture: true });
    };
  }, [mounted, toggleSidebar]);

  // Inline handlers as ultimate fallback
  const handleDirectClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
  };

  const handleTouchStartReact = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchEndReact = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`react-burger-menu ${className}`}
      onClick={handleDirectClick}
      onMouseDown={handleDirectClick}
      onTouchStart={handleTouchStartReact}
      onTouchEnd={handleTouchEndReact}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      aria-expanded={isOpen}
      data-react-handler="true"
      style={{
        minWidth: '48px',
        minHeight: '48px',
        padding: '12px',
        touchAction: 'manipulation',
        border: 'none',
        borderRadius: '0',
        backgroundColor: 'transparent',
        color: 'var(--bs-topbar-item-color)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
        pointerEvents: 'auto',
        position: 'relative',
        zIndex: 9999
      }}
    >
      <iconify-icon 
        icon="solar:hamburger-menu-broken" 
        className={iconClassName}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      ></iconify-icon>
    </button>
  );
}
