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
    console.log('BurgerMenu mounted');
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const button = buttonRef.current;
    if (!button) {
      console.error('Button ref is null');
      return;
    }

    console.log('Setting up button handlers');

    let touchStartTime = 0;
    let touchMoved = false;

    // Touch event handler for mobile
    const handleTouchStart = (e: TouchEvent) => {
      console.log('Touch start on button');
      touchStartTime = Date.now();
      touchMoved = false;
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      console.log('Touch move detected');
      touchMoved = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      console.log('Touch end on button');
      const touchDuration = Date.now() - touchStartTime;
      
      // Only trigger if it was a tap (not a scroll/swipe)
      if (!touchMoved && touchDuration < 500) {
        console.log('Valid tap detected!');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleSidebar();
      }
    };

    // Click handler for desktop
    const handleClick = (e: MouseEvent) => {
      console.log('Click detected!', e.type);
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
    console.log('Inline React handler fired');
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
  };

  const handleTouchStartReact = (e: React.TouchEvent) => {
    console.log('React touch start inline');
    e.stopPropagation();
  };

  const handleTouchEndReact = (e: React.TouchEvent) => {
    console.log('React touch end inline - triggering sidebar');
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
