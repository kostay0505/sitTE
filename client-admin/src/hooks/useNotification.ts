import { useState, useCallback } from 'react';
import { NotificationProps } from '@/types/common';

interface UseNotificationReturn {
  notification: NotificationProps | null;
  showNotification: (notification: Omit<NotificationProps, 'onClose'>) => void;
  hideNotification: () => void;
}

export const useNotification = (): UseNotificationReturn => {
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = useCallback((notificationData: Omit<NotificationProps, 'onClose'>) => {
    setNotification({
      ...notificationData,
      onClose: () => setNotification(null),
    });

    // Автоматически скрываем уведомление через 5 секунд
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
}; 