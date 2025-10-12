'use client';

import React from 'react';
import { useNotification } from '@/hooks/useInteractive';

export default function NotificationSystem() {
  const { notifications, removeNotification } = useNotification();

  const getNotificationClass = (type: string) => {
    const classes = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info'
    };
    return classes[type as keyof typeof classes] || 'alert-info';
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      success: 'bx-check-circle',
      error: 'bx-error-circle',
      warning: 'bx-error',
      info: 'bx-info-circle'
    };
    return icons[type as keyof typeof icons] || 'bx-info-circle';
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container position-fixed" style={{ 
      top: '20px', 
      right: '20px', 
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`alert ${getNotificationClass(notification.type)} alert-dismissible fade show mb-2`}
          role="alert"
        >
          <div className="d-flex align-items-center">
            <i className={`bx ${getNotificationIcon(notification.type)} me-2`}></i>
            <span className="flex-grow-1">{notification.message}</span>
            <button
              type="button"
              className="btn-close"
              onClick={() => removeNotification(notification.id)}
              aria-label="Close"
            ></button>
          </div>
        </div>
      ))}
    </div>
  );
}
