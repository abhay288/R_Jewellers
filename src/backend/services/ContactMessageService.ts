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

        const { EmailService } = require('./EmailService');
        const emailService = new EmailService();

        for (const admin of admins) {
          await this.notificationService.createNotification(
            admin._id.toString(),
            adminTitle,
            adminBody,
            'system',
            link
          );

          await emailService.sendEmail(
            admin.email,
            `New Contact Inquiry: ${data.subject}`,
            `
              <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
                <h2 style="color: #8c765c; border-bottom: 2px solid #8c765c; padding-bottom: 10px; font-family: serif;">New Contact Inquiry Received</h2>
                <p>Hello Admin,</p>
                <p>You have received a new customer inquiry on the Radhika Jewellers website.</p>
                <div style="background: #faf8f6; padding: 15px; border: 1px solid #e5dfd9; margin: 20px 0; border-radius: 6px;">
                  <strong>Inquiry Details:</strong><br/>
                  • Name: ${data.firstName} ${data.lastName}<br/>
                  • Email: ${data.email}<br/>
                  • Subject: ${data.subject}<br/>
                  • Message:<br/>
                  <p style="background: #ffffff; padding: 10px; border: 1px solid #eee; border-radius: 4px; margin-top: 5px;">
                    ${data.message}
                  </p>
                </div>
                <p>With Warm Regards,<br/>Radhika Jewellers Concierge System</p>
              </div>
            `
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
