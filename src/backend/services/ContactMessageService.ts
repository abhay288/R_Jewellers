import { ContactMessageRepository } from '../repositories/ContactMessageRepository';
import { NotificationService } from './NotificationService';
import User from '../models/User';
import ContactMessage from '../models/ContactMessage';

export class ContactMessageService {
  private repository: ContactMessageRepository;
  private notificationService: NotificationService;

  constructor() {
    this.repository = new ContactMessageRepository();
    this.notificationService = new NotificationService();
  }

  async createMessage(data: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }) {
    // 1. Save contact message to database
    const message = await this.repository.create(data);

    // 2. Notify all admin users
    try {
      const admins = await User.find({ role: 'admin' });
      const adminTitle = 'New Contact Inquiry';
      const adminBody = `${data.firstName} ${data.lastName} sent a message: "${data.subject}"`;
      const link = '/admin/messages';

      for (const admin of admins) {
        await this.notificationService.createNotification(
          admin._id.toString(),
          adminTitle,
          adminBody,
          'system',
          link
        );
      }
    } catch (error) {
      console.error('Failed to notify admins of new contact message:', error);
    }

    return message;
  }

  async getMessages(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const items = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await ContactMessage.countDocuments();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(id: string) {
    return await ContactMessage.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
  }
}
