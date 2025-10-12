/**
 * React Override Script
 * This script disables the vanilla JS sidebar toggle to prevent conflicts with React
 */

(function() {
  'use strict';
  
  console.log('React override script loaded');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('Initializing React override');

    // Remove all event listeners from button-toggle-menu
    const buttons = document.querySelectorAll('.button-toggle-menu, .react-burger-menu');
    
    buttons.forEach((button) => {
      // Clone button to remove all event listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      console.log('Cleaned button:', newButton.className);
    });

    // Prevent the layout.js from attaching handlers
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      // If it's the toggle menu and the event is click, log it
      if (this.classList && (this.classList.contains('button-toggle-menu') || this.classList.contains('react-burger-menu')) && type === 'click') {
        // Check if it's from React (will have 'Inline React handler' in the listener)
        const listenerStr = listener.toString();
        if (!listenerStr.includes('toggleSidebar') && !listenerStr.includes('React')) {
          console.log('Blocking vanilla JS click handler');
          return; // Don't attach the vanilla JS handler
        }
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    console.log('React override complete');
  }

  // Also try to stop the ThemeLayout initialization
  window.addEventListener('DOMContentLoaded', function() {
    // Give React time to mount
    setTimeout(function() {
      console.log('Checking for React burger menu');
      const reactButton = document.querySelector('.react-burger-menu');
      if (reactButton) {
        console.log('React burger menu found, disabling vanilla handlers');
        // Prevent further vanilla JS interference
        reactButton.style.pointerEvents = 'auto';
        reactButton.style.position = 'relative';
        reactButton.style.zIndex = '9999';
      }
    }, 100);
  }, { capture: true });
})();

