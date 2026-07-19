import { NotificationRepository } from '../repositories/NotificationRepository';
import Notification from '../models/Notification';
import DeviceToken from '../models/DeviceToken';
import User from '../models/User';
import { firebaseAdmin } from '@/shared/lib/firebase-admin';

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  /**
   * Creates a notification for a user
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'order' | 'promo' | 'system' | 'account' = 'system',
    link?: string
  ) {
    try {
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        link,
      });

      // Automatically trigger push notification
      await this.sendPushNotification(userId, title, message, link);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't throw to prevent blocking the main transaction
    }
  }

  /**
   * Sends an FCM push notification to a specific user's registered devices
   */
  async sendPushNotification(userId: string, title: string, body: string, link?: string) {
    try {
      // 1. Fetch user to verify notification preferences
      const user = await User.findById(userId);
      if (user?.notificationPreferences && !user.notificationPreferences.orderStatus) {
        console.log(`User ${userId} has opted out of order status push notifications.`);
        return;
      }

      // 2. Fetch registered device tokens for the user
      const devices = await DeviceToken.find({ user: userId });
      if (!devices || devices.length === 0) {
        console.log(`No registered push tokens found for user ${userId}. Logging mock push: [${title}] ${body}`);
        return;
      }

      const tokens = devices.map(d => d.token);

      // 3. Send using Firebase Admin SDK if configured
      if (firebaseAdmin) {
        const messaging = firebaseAdmin.messaging();
        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: { title, body },
          data: link ? { url: link } : {},
        });

        console.log(`Push notifications status: ${response.successCount} sent, ${response.failureCount} failed.`);

        // Clean up expired tokens
        const expiredTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const code = resp.error?.code;
            if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
              expiredTokens.push(tokens[idx]);
            }
          }
        });

        if (expiredTokens.length > 0) {
          await DeviceToken.deleteMany({ token: { $in: expiredTokens } });
          console.log(`Cleaned up ${expiredTokens.length} invalid device token(s).`);
        }
      } else {
        console.log(`[Push Sim] User: ${userId} | Title: ${title} | Body: ${body} | Link: ${link}`);
      }
    } catch (error) {
      console.error('Error in sendPushNotification:', error);
    }
  }

  /**
   * Sends an FCM push notification to all admins
   */
  async sendAdminPushNotification(title: string, body: string, link?: string) {
    try {
      // 1. Fetch all admins
      const admins = await User.find({ role: 'admin' });
      if (!admins || admins.length === 0) return;

      const adminIds = admins.map(a => a._id);

      // 2. Get registered device tokens for all admins
      const devices = await DeviceToken.find({ user: { $in: adminIds } });
      if (!devices || devices.length === 0) {
        console.log(`No registered admin push tokens. Logging mock admin push: [${title}] ${body}`);
        return;
      }

      const tokens = devices.map(d => d.token);

      // 3. Send via Firebase Admin SDK
      if (firebaseAdmin) {
        const messaging = firebaseAdmin.messaging();
        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: { title, body },
          data: link ? { url: link } : {},
        });
        console.log(`Admin push notifications status: ${response.successCount} sent, ${response.failureCount} failed.`);
      } else {
        console.log(`[Admin Push Sim] Title: ${title} | Body: ${body} | Link: ${link}`);
      }
    } catch (error) {
      console.error('Error in sendAdminPushNotification:', error);
    }
  }

  /**
   * Triggered on Order Status Change
   */
  async sendOrderStatusNotification(userId: string, orderId: string, status: string) {
    let title = '';
    let message = '';
    const link = `/profile/orders/${orderId}`;

    switch (status) {
      case 'Order Placed':
        title = 'Order Placed Successfully';
        message = `Your order ${orderId} has been placed and is waiting for confirmation.`;
        break;
      case 'Confirmed':
        title = 'Order Confirmed';
        message = `Great news! Your order ${orderId} has been confirmed.`;
        break;
      case 'Packed':
        title = 'Order Packed';
        message = `Your order ${orderId} is packed and ready to be shipped.`;
        break;
      case 'Shipped':
        title = 'Order Shipped';
        message = `Your order ${orderId} is on the way!`;
        break;
      case 'Out For Delivery':
        title = 'Order Out For Delivery';
        message = `Your order ${orderId} is out for delivery today.`;
        break;
      case 'Delivered':
        title = 'Order Delivered';
        message = `Your order ${orderId} has been delivered. Enjoy your purchase!`;
        break;
      case 'Cancelled':
        title = 'Order Cancelled';
        message = `Your order ${orderId} has been cancelled.`;
        break;
    }

    if (title) {
      await this.createNotification(userId, title, message, 'order', link);
    }

    // Trigger admin push notification for new order placement
    if (status === 'Order Placed') {
      await this.sendAdminPushNotification(
        'New Order Placed',
        `Order ${orderId} has been placed successfully by customer.`,
        `/admin/orders/${orderId}`
      );
    }
  }
}
