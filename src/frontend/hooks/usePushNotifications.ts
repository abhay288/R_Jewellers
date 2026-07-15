"use client";

import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/shared/lib/firebase';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const registerTokenWithServer = useCallback(async (fcmToken: string) => {
    try {
      await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: fcmToken, deviceType: 'web' }),
      });
    } catch (err) {
      console.error('Failed to register FCM token with server:', err);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return false;
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        const fcmMessaging = await messaging;
        if (fcmMessaging) {
          // VAPID keys can be public or empty depending on project setup.
          // In standard Web Push, FCM requires a VAPID Key.
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          const currentToken = await getToken(fcmMessaging, { vapidKey });
          
          if (currentToken) {
            setToken(currentToken);
            await registerTokenWithServer(currentToken);
            console.log('FCM Device Token registered successfully:', currentToken);
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
        }
      }
    } catch (err) {
      console.error('An error occurred while requesting notification permission:', err);
    } finally {
      setLoading(false);
    }
  }, [registerTokenWithServer]);

  // Handle foreground messages
  useEffect(() => {
    let unsubscribe = () => {};

    async function setupMessageListener() {
      const fcmMessaging = await messaging;
      if (fcmMessaging) {
        unsubscribe = onMessage(fcmMessaging, (payload) => {
          console.log('Foreground message received:', payload);
          // Show a premium toast notification or custom notification banner
          if (payload.notification) {
            new Notification(payload.notification.title || 'Radhika Jewellers', {
              body: payload.notification.body,
              icon: '/icon.png',
            });
          }
        });
      }
    }

    setupMessageListener();
    return () => unsubscribe();
  }, []);

  return {
    permission,
    token,
    loading,
    requestPermission,
  };
}
