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
   * Creates an in-app notification for a user and triggers a branded push notification
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

      // Automatically trigger push notification with brand metadata
      await this.sendPushNotification(userId, title, message, link);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Sends an FCM push notification to a specific user's registered devices with Radhika Jewellers branding
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
        console.log(`No registered push tokens found for user ${userId}. Logging push event: [${title}] ${body}`);
        return;
      }

      const tokens = devices.map(d => d.token);
      const appUrl = process.env.NEXTAUTH_URL || 'https://www.radhikajewellers.store';
      const logoUrl = `${appUrl}/assets/logo.png`;
      const destinationUrl = link ? (link.startsWith('http') ? link : `${appUrl}${link}`) : appUrl;

      // 3. Send using Firebase Admin SDK if configured
      if (firebaseAdmin) {
        const messaging = firebaseAdmin.messaging();
        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: { 
            title: title.includes('Radhika') ? title : `${title} | Radhika Jewellers`, 
            body 
          },
          data: {
            url: destinationUrl,
            link: destinationUrl,
            title,
            body,
            brand: 'Radhika Jewellers'
          },
          webpush: {
            notification: {
              title: title.includes('Radhika') ? title : `${title} | Radhika Jewellers`,
              body,
              icon: logoUrl,
              badge: logoUrl,
            },
            fcmOptions: {
              link: destinationUrl
            }
          }
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
        console.log(`[Push Sim] User: ${userId} | Title: ${title} | Body: ${body} | Link: ${destinationUrl}`);
      }
    } catch (error) {
      console.error('Error in sendPushNotification:', error);
    }
  }

  /**
   * Sends an FCM push notification to all store administrators
   */
  async sendAdminPushNotification(title: string, body: string, link?: string) {
    try {
      const admins = await User.find({ role: 'admin' });
      if (!admins || admins.length === 0) return;

      const adminIds = admins.map(a => a._id);
      const devices = await DeviceToken.find({ user: { $in: adminIds } });
      if (!devices || devices.length === 0) {
        console.log(`No registered admin push tokens. Logging admin push: [${title}] ${body}`);
        return;
      }

      const tokens = devices.map(d => d.token);
      const appUrl = process.env.NEXTAUTH_URL || 'https://www.radhikajewellers.store';
      const logoUrl = `${appUrl}/assets/logo.png`;
      const destinationUrl = link ? (link.startsWith('http') ? link : `${appUrl}${link}`) : `${appUrl}/admin`;

      if (firebaseAdmin) {
        const messaging = firebaseAdmin.messaging();
        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: { 
            title: title.includes('Admin') ? title : `${title} | Admin Alert`, 
            body 
          },
          data: {
            url: destinationUrl,
            link: destinationUrl,
            title,
            body
          },
          webpush: {
            notification: {
              title: title.includes('Admin') ? title : `${title} | Admin Alert`,
              body,
              icon: logoUrl,
              badge: logoUrl,
            },
            fcmOptions: {
              link: destinationUrl
            }
          }
        });
        console.log(`Admin push status: ${response.successCount} sent, ${response.failureCount} failed.`);
      } else {
        console.log(`[Admin Push Sim] Title: ${title} | Body: ${body} | Link: ${destinationUrl}`);
      }
    } catch (error) {
      console.error('Error in sendAdminPushNotification:', error);
    }
  }

  /**
   * Broadcasts a push and in-app notification to all users (or targeted group) from Admin Panel
   */
  async broadcastNotification(
    title: string,
    message: string,
    type: 'order' | 'promo' | 'system' | 'account' = 'promo',
    link: string = '/shop',
    targetGroup: 'all' | 'customers' = 'all'
  ) {
    try {
      let query: any = {};
      if (targetGroup === 'customers') {
        query.role = 'user';
      }
      const users = await User.find(query).select('_id');
      if (!users || users.length === 0) {
        return { success: false, error: 'No matching users found to broadcast.' };
      }

      const userIds = users.map(u => u._id);

      // Bulk create in-app Notification records for targeted users
      const notificationDocs = userIds.map(uId => ({
        user: uId,
        title,
        message,
        type,
        link,
        isRead: false
      }));

      await Notification.insertMany(notificationDocs);

      // Fetch active device push tokens
      const devices = await DeviceToken.find({ user: { $in: userIds } });
      const tokens = Array.from(new Set(devices.map(d => d.token)));

      let pushSentCount = 0;

      if (tokens.length > 0 && firebaseAdmin) {
        const appUrl = process.env.NEXTAUTH_URL || 'https://www.radhikajewellers.store';
        const logoUrl = `${appUrl}/assets/logo.png`;
        const destinationUrl = link ? (link.startsWith('http') ? link : `${appUrl}${link}`) : `${appUrl}/shop`;

        const messaging = firebaseAdmin.messaging();
        const batchSize = 500;
        for (let i = 0; i < tokens.length; i += batchSize) {
          const tokenBatch = tokens.slice(i, i + batchSize);
          const response = await messaging.sendEachForMulticast({
            tokens: tokenBatch,
            notification: {
              title,
              body: message
            },
            data: {
              url: destinationUrl,
              link: destinationUrl,
              title,
              body: message
            },
            webpush: {
              notification: {
                title,
                body: message,
                icon: logoUrl,
                badge: logoUrl
              },
              fcmOptions: {
                link: destinationUrl
              }
            }
          });
          pushSentCount += response.successCount;
        }
      }

      console.log(`[Broadcast Completed] Target: ${targetGroup} | Users notified: ${userIds.length} | Push sent: ${pushSentCount}`);

      return {
        success: true,
        userCount: userIds.length,
        pushCount: pushSentCount,
        message: `Broadcast notification successfully sent to ${userIds.length} user(s) (${pushSentCount} push alerts delivered).`
      };

    } catch (error: any) {
      console.error('Error in broadcastNotification:', error);
      throw error;
    }
  }

  /**
   * Order Events Push & Notification Handler
   */
  async sendOrderStatusNotification(userId: string, orderId: string, status: string) {
    let title = '';
    let message = '';
    const link = `/profile/orders/${orderId}`;

    switch (status) {
      case 'Order Placed':
        title = '🛍️ Order Placed Successfully';
        message = `Your order ${orderId} has been received and is waiting for processing.`;
        break;
      case 'Confirmed':
        title = '👑 Order Confirmed';
        message = `Great news! Your order ${orderId} has been confirmed & is being prepared.`;
        break;
      case 'Packed':
        title = '🎁 Order Packed & Ready';
        message = `Your order ${orderId} is beautifully packaged and ready to be shipped.`;
        break;
      case 'Shipped':
        title = '🚚 Order Shipped & En Route';
        message = `Your order ${orderId} is on the way to your delivery address!`;
        break;
      case 'Out For Delivery':
        title = '🛵 Out For Delivery Today';
        message = `Your package for order ${orderId} is out for delivery today.`;
        break;
      case 'Delivered':
        title = '✨ Order Delivered';
        message = `Your order ${orderId} has been delivered. We hope you adore your luxury piece!`;
        break;
      case 'Cancelled':
        title = '❌ Order Cancelled';
        message = `Your order ${orderId} has been cancelled. Please contact support if you need help.`;
        break;
    }

    if (title) {
      await this.createNotification(userId, title, message, 'order', link);
    }

    // Trigger admin alert on new order confirmation
    if (status === 'Confirmed' || status === 'Order Placed') {
      await this.sendAdminPushNotification(
        `🛍️ New Order #${orderId}`,
        `A new order of ₹${orderId} has been placed. Review details in admin panel.`,
        `/admin/orders/${orderId}`
      );
    }
  }

  /**
   * Return & Refund Events Push & Notification Handler
   */
  async sendReturnStatusNotification(userId: string, returnId: string, orderId: string, status: string, amount?: number) {
    let title = '';
    let message = '';
    const link = `/profile/orders/${orderId}`;

    switch (status) {
      case 'Return Requested':
        title = '🔄 Return Request Received';
        message = `We have received your return request ${returnId} for order ${orderId}.`;
        break;
      case 'Under Review':
      case 'Approved':
      case 'Return Approved':
        title = '✅ Return Request Approved';
        message = `Your return request ${returnId} has been approved. Pickup is being scheduled.`;
        break;
      case 'Quality Check':
        title = '🔍 Quality Check in Progress';
        message = `Your returned item for request ${returnId} is undergoing quality verification.`;
        break;
      case 'Refund Completed':
        title = '💰 Refund Processed Successfully';
        message = `Your refund ${amount ? `of ₹${amount.toLocaleString('en-IN')}` : ''} for return ${returnId} has been credited via UPI.`;
        break;
      case 'Rejected':
        title = '⚠️ Return Request Update';
        message = `Your return request ${returnId} could not be approved. Please check details.`;
        break;
    }

    if (title) {
      await this.createNotification(userId, title, message, 'order', link);
    }

    if (status === 'Return Requested') {
      await this.sendAdminPushNotification(
        `🔄 New Return Request #${returnId}`,
        `Return request ${returnId} submitted for order ${orderId}.`,
        `/admin/returns`
      );
    }
  }

  /**
   * Inventory & Stock Alerts for Admin
   */
  async sendLowStockNotification(productName: string, currentStock: number) {
    await this.sendAdminPushNotification(
      '⚠️ Low Stock Warning',
      `Product "${productName}" is low on stock (${currentStock} items remaining).`,
      '/admin/inventory'
    );
  }

  /**
   * Contact Inquiry Alert for Admin
   */
  async sendContactMessageNotification(senderName: string, subject: string) {
    await this.sendAdminPushNotification(
      '💬 New Customer Message',
      `New inquiry from ${senderName}: "${subject}".`,
      '/admin/messages'
    );
  }
}
