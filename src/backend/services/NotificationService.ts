import { NotificationRepository } from '../repositories/NotificationRepository';
import Notification from '../models/Notification';

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

      // Prepare for future integrations here (Email, FCM, WhatsApp)
      // await this.sendEmailNotification(user, title, message);
      // await this.sendPushNotification(user, title, message);
      // await this.sendWhatsAppNotification(user, title, message);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't throw to prevent blocking the main transaction
    }
  }

  /**
   * Triggered on Order Status Change
   */
  async sendOrderStatusNotification(userId: string, orderId: string, status: string) {
    let title = '';
    let message = '';
    let link = `/profile/orders/${orderId}`;

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
  }
}
