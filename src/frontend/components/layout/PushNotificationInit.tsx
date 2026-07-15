"use client";

import { useEffect } from 'react';
import { usePushNotifications } from '@/frontend/hooks/usePushNotifications';

export default function PushNotificationInit() {
  const { requestPermission, permission } = usePushNotifications();

  useEffect(() => {
    // Request permission automatically with a 5-second delay to preserve premium UX on load
    const timer = setTimeout(() => {
      if (permission === 'default') {
        requestPermission();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [permission, requestPermission]);

  return null;
}
