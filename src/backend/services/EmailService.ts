import nodemailer from 'nodemailer';
import { SettingService } from './SettingService';
import User from '../models/User';

export class EmailService {
  private settingService: SettingService;

  constructor() {
    this.settingService = new SettingService();
  }

  /**
   * Helper to initialize nodemailer transporter dynamically using DB settings or ENV.
   */
  private async getTransporter() {
    const host = await this.settingService.getSettingByKey('smtpHost', process.env.SMTP_HOST);
    const port = await this.settingService.getSettingByKey('smtpPort', process.env.SMTP_PORT || '587');
    const user = await this.settingService.getSettingByKey('smtpUser', process.env.SMTP_USER);
    const pass = await this.settingService.getSettingByKey('smtpPass', process.env.SMTP_PASS);

    if (!host || !user || !pass) {
      console.warn('SMTP Credentials missing. Transactional emails will be simulated.');
      return null;
    }

    return nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: port === '465',
      auth: { user, pass },
    });
  }

  /**
   * Send a general HTML email
   */
  async sendEmail(to: string, subject: string, html: string, attachments?: any[]) {
    try {
      const transporter = await this.getTransporter();
      const fromEmail = await this.settingService.getSettingByKey('smtpFrom', process.env.SMTP_FROM || 'no-reply@radhikajewellers.com');
      const storeName = await this.settingService.getSettingByKey('storeName', 'Radhika Jewellers');

      if (transporter) {
        const info = await transporter.sendMail({
          from: `"${storeName}" <${fromEmail}>`,
          to,
          subject,
          html,
          attachments,
        });
        console.log(`Email sent successfully: ${info.messageId}`);
        return true;
      } else {
        console.log(`[Email Sim] TO: ${to} | SUBJECT: ${subject} | CONTENT: Check server logs for details.`);
        return true;
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Wrapper for Luxury Email Design
   */
  private getLuxuryWrapper(title: string, contentHtml: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Playfair Display', Georgia, Cambria, "Times New Roman", Times, serif;
            background-color: #fcfbfa;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border: 1px solid #e5dfd9;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border-top: 6px solid #8c765c;
          }
          .header {
            text-align: center;
            padding: 40px 20px;
            background-color: #ffffff;
            border-bottom: 1px solid #f5f2ef;
          }
          .logo {
            font-size: 26px;
            letter-spacing: 4px;
            text-transform: uppercase;
            font-weight: 700;
            color: #8c765c;
            text-decoration: none;
            margin: 0;
          }
          .tagline {
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #9c9287;
            margin-top: 5px;
          }
          .content {
            padding: 40px 40px 20px 40px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            line-height: 1.6;
            color: #333333;
          }
          .title {
            font-family: 'Playfair Display', Georgia, Cambria, serif;
            font-size: 22px;
            color: #8c765c;
            margin-bottom: 24px;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background-color: #8c765c;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 36px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
            border-radius: 2px;
          }
          .footer {
            background-color: #faf8f6;
            padding: 30px 40px;
            text-align: center;
            font-size: 12px;
            color: #8c765c;
            border-top: 1px solid #f5f2ef;
            letter-spacing: 1px;
          }
          .divider {
            height: 1px;
            background-color: #e5dfd9;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Radhika Jewellers</h1>
            <div class="tagline">Heritage of Premium Luxury</div>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Radhika Jewellers. All Rights Reserved.</p>
            <p style="font-size: 10px; color: #a1978d; margin-top: 10px;">
              You are receiving this because you registered or subscribed to Radhika Jewellers.<br>
              123 Luxury Lane, Palace Road, Jaipur, India
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 1. Send Welcome Email
   */
  async sendWelcomeEmail(to: string, name: string) {
    const html = this.getLuxuryWrapper(
      'Welcome to Radhika Jewellers',
      `
        <h2 class="title">Welcome to the Inner Circle</h2>
        <p>Dear ${name},</p>
        <p>It is our absolute pleasure to welcome you to <strong>Radhika Jewellers</strong>, where timeless heritage meets modern elegance.</p>
        <p>Your account has been successfully created. You can now explore our curated collections, save your favorite pieces to your wishlist, and enjoy a seamless luxury shopping experience.</p>
        <div class="button-container">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shop" class="button">Explore Collections</a>
        </div>
        <p>Should you need any assistance, our dedicated concierge team is always here to guide you.</p>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );
    return this.sendEmail(to, 'Welcome to Radhika Jewellers', html);
  }

  /**
   * 2. Send Account Verification Email
   */
  async sendVerificationEmail(to: string, name: string, token: string) {
    const verifyLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;
    const html = this.getLuxuryWrapper(
      'Verify Your Account',
      `
        <h2 class="title">Verify Your Email Address</h2>
        <p>Dear ${name},</p>
        <p>Thank you for choosing Radhika Jewellers. To complete your registration and secure your account, please verify your email address by clicking the link below:</p>
        <div class="button-container">
          <a href="${verifyLink}" class="button">Verify Email</a>
        </div>
        <p>If you did not request this registration, please ignore this email.</p>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );
    return this.sendEmail(to, 'Verify Your Radhika Jewellers Account', html);
  }

  /**
   * 3. Send Forgot Password Email
   */
  async sendForgotPasswordEmail(to: string, name: string, token: string) {
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const html = this.getLuxuryWrapper(
      'Reset Your Password',
      `
        <h2 class="title">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>We received a request to reset the password for your Radhika Jewellers account. Click the button below to choose a new password:</p>
        <div class="button-container">
          <a href="${resetLink}" class="button">Reset Password</a>
        </div>
        <p>This link is valid for 1 hour. If you did not make this request, your account remains secure and no action is required.</p>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );
    return this.sendEmail(to, 'Reset Your Password - Radhika Jewellers', html);
  }

  /**
   * 4. Send Reset Password Email
   */
  async sendResetPasswordEmail(to: string, name: string) {
    const html = this.getLuxuryWrapper(
      'Password Reset Successfully',
      `
        <h2 class="title">Password Changed Successfully</h2>
        <p>Dear ${name},</p>
        <p>The password for your Radhika Jewellers account has been successfully updated.</p>
        <p>If you did not perform this change, please contact our customer concierge immediately to secure your account.</p>
        <div class="button-container">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" class="button">Log In Now</a>
        </div>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );
    return this.sendEmail(to, 'Password Security Alert - Radhika Jewellers', html);
  }

  /**
   * 5. Send Order Confirmation Email
   */
  async sendOrderConfirmationEmail(to: string, name: string, order: any) {
    const itemsHtml = order.products.map((item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f5f2ef;">${item.name} (x${item.quantity})</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f5f2ef; text-align: right;">₹${item.finalPrice * item.quantity}</td>
      </tr>
    `).join('');

    const html = this.getLuxuryWrapper(
      'Order Confirmed',
      `
        <h2 class="title">Order Confirmed</h2>
        <p>Dear ${name},</p>
        <p>Thank you for shopping with Radhika Jewellers. We are delighted to confirm that your order <strong>${order.orderId}</strong> has been received and is being prepared.</p>
        
        <div style="background-color: #faf8f6; padding: 20px; border: 1px solid #e5dfd9; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #8c765c; font-family: 'Playfair Display', serif;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${itemsHtml}
            <tr>
              <td style="padding: 15px 0 5px; font-weight: bold;">Subtotal</td>
              <td style="padding: 15px 0 5px; text-align: right; font-weight: bold;">₹${order.totalAmount - order.deliveryCharges + order.discount}</td>
            </tr>
            ${order.discount ? `
            <tr>
              <td style="padding: 5px 0; color: #8c765c;">Discount</td>
              <td style="padding: 5px 0; text-align: right; color: #8c765c;">-₹${order.discount}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 5px 0;">Delivery Charges</td>
              <td style="padding: 5px 0; text-align: right;">₹${order.deliveryCharges}</td>
            </tr>
            <tr style="border-top: 2px solid #8c765c;">
              <td style="padding: 10px 0 0; font-weight: bold; font-size: 16px;">Total Amount</td>
              <td style="padding: 10px 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #8c765c;">₹${order.totalAmount}</td>
            </tr>
          </table>
        </div>

        <p>We will notify you as soon as your luxury pieces are shipped.</p>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );
    return this.sendEmail(to, `Order Confirmation - ${order.orderId}`, html);
  }

  /**
   * 6. Send Order Status Changed Email
   */
  async sendOrderStatusChangedEmail(
    to: string,
    name: string,
    orderId: string,
    status: string,
    extras?: { courierName?: string; awbNumber?: string; estimatedDelivery?: Date }
  ) {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://radhikajewellers.store';
    const trackingUrl = extras?.awbNumber
      ? `${baseUrl}/orders/${extras.awbNumber}`
      : `${baseUrl}/orders/${orderId}`;

    const isShipped = status === 'Shipped' || status === 'Out For Delivery';

    const shippingInfo = isShipped && extras?.courierName ? `
      <div style="background-color:#faf8f6;border:1px solid #e5dfd9;border-radius:8px;padding:20px;margin:20px 0;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          ${extras.courierName ? `<tr><td style="padding:6px 0;color:#8c765c;font-weight:bold;">Courier Partner</td><td style="padding:6px 0;">${extras.courierName}</td></tr>` : ''}
          ${extras.awbNumber ? `<tr><td style="padding:6px 0;color:#8c765c;font-weight:bold;">Tracking Number</td><td style="padding:6px 0;font-family:monospace;">${extras.awbNumber}</td></tr>` : ''}
          ${extras.estimatedDelivery ? `<tr><td style="padding:6px 0;color:#8c765c;font-weight:bold;">Expected Delivery</td><td style="padding:6px 0;">${new Date(extras.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>` : ''}
        </table>
      </div>` : '';

    const subject = isShipped
      ? `Your order has been shipped 🚚 — ${orderId}`
      : `Order Update: ${status} — ${orderId}`;

    const body = isShipped
      ? `Hello ${name},<br><br>Great news! Your order <strong>${orderId}</strong> has been handed over to our courier partner and is on its way to you.${shippingInfo}<p>Click the button below to track your parcel in real-time.</p>`
      : `Dear ${name},<br><br>Your order <strong>${orderId}</strong> status has been updated to: <strong>${status}</strong>.`;

    const html = this.getLuxuryWrapper(
      isShipped ? 'Your Order Is On Its Way! 🚚' : 'Order Status Update',
      `
        <h2 class="title">${isShipped ? 'Your Order Has Been Shipped!' : 'Order Status Updated'}</h2>
        <p>${body}</p>

        <div class="button-container">
          <a href="${trackingUrl}" class="button">Track Your Order</a>
        </div>

        <p style="font-size:12px;color:#999;margin-top:16px;">Tracking link: <a href="${trackingUrl}" style="color:#8c765c;">${trackingUrl}</a></p>
        <p>If you have any questions, please reply to this email.</p>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );
    return this.sendEmail(to, subject, html);
  }

  /**
   * 7. Send Invoice Email
   */
  async sendInvoiceEmail(to: string, name: string, order: any, pdfBuffer: Buffer) {
    const html = this.getLuxuryWrapper(
      'Your Invoice',
      `
        <h2 class="title">Your Invoice is Ready</h2>
        <p>Dear ${name},</p>
        <p>Please find attached the official tax invoice for your recent order <strong>${order.orderId}</strong>.</p>
        <p>We hope you enjoy your luxury jewelry piece. Thank you for placing your trust in Radhika Jewellers.</p>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );

    return this.sendEmail(to, `Invoice for Order - ${order.orderId}`, html, [
      {
        filename: `invoice-${order.orderId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }
    ]);
  }

  /**
   * 8. Send Return Approved Email
   */
  async sendReturnApprovedEmail(to: string, name: string, returnId: string) {
    const html = this.getLuxuryWrapper(
      'Return Approved',
      `
        <h2 class="title">Return Request Approved</h2>
        <p>Dear ${name},</p>
        <p>Your return request for return ID <strong>${returnId}</strong> has been reviewed and approved by our quality control team.</p>
        <p>Our courier partner will arrive within 2-3 business days to collect the package. Please ensure the jewelry is placed in its original luxury packaging, complete with tags and certificates.</p>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );
    return this.sendEmail(to, `Return Request Approved - ${returnId}`, html);
  }

  /**
   * 9. Send Refund Completed Email
   */
  async sendRefundCompletedEmail(to: string, name: string, returnId: string, amount: number) {
    const html = this.getLuxuryWrapper(
      'Refund Completed',
      `
        <h2 class="title">Refund Processed Successfully</h2>
        <p>Dear ${name},</p>
        <p>We have successfully processed a refund of <strong>₹${amount}</strong> for your return ID <strong>${returnId}</strong>.</p>
        <p>The funds will reflect in your account within 5-7 business days depending on your payment method.</p>
        <p>We look forward to welcoming you back to Radhika Jewellers in the future.</p>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );
    return this.sendEmail(to, `Refund Completed - ${returnId}`, html);
  }

  /**
   * 10. Send Newsletter Welcoming Email
   */
  async sendNewsletterEmail(to: string) {
    const html = this.getLuxuryWrapper(
      'Subscribed to Radhika Jewellers Newsletter',
      `
        <h2 class="title">Welcome to Our Newsletter</h2>
        <p>Thank you for subscribing to the Radhika Jewellers newsletter.</p>
        <p>As a subscriber, you will be the first to receive updates on our new collection launches, exclusive seasonal discounts, styling guides, and invitation-only private sales events.</p>
        <div class="button-container">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shop" class="button">Shop New Arrivals</a>
        </div>
        <p>With Warm Regards,<br>The Radhika Jewellers Team</p>
      `
    );
    return this.sendEmail(to, 'Subscribed to Radhika Jewellers News & Offers', html);
  }

  /**
   * Helper to retrieve all admin emails or fallback to supportEmail.
   */
  private async getAdminEmails(): Promise<string[]> {
    try {
      const admins = await User.find({ role: 'admin' }).select('email').exec();
      if (admins && admins.length > 0) {
        return admins.map((a: any) => a.email);
      }
    } catch (err) {
      console.error('Failed to fetch admin emails from DB:', err);
    }
    const fallbackEmail = await this.settingService.getSettingByKey('supportEmail', 'support@radhikajewellers.com');
    return [fallbackEmail];
  }

  /**
   * Send a new order alert email to the store owner (admins)
   */
  async sendOwnerNewOrderAlertEmail(order: any) {
    const adminEmails = await this.getAdminEmails();
    if (adminEmails.length === 0) return;

    const itemsHtml = order.products.map((item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f5f2ef;">${item.name} (x${item.quantity})</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f5f2ef; text-align: right;">₹${item.finalPrice * item.quantity}</td>
      </tr>
    `).join('');

    const html = this.getLuxuryWrapper(
      'New Order Received',
      `
        <h2 class="title">New Order Received</h2>
        <p>Dear Owner,</p>
        <p>A new order <strong>${order.orderId}</strong> has been successfully placed by a customer.</p>
        
        <div style="background-color: #faf8f6; padding: 20px; border: 1px solid #e5dfd9; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #8c765c; font-family: 'Playfair Display', serif;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${itemsHtml}
            <tr>
              <td style="padding: 15px 0 5px; font-weight: bold;">Subtotal</td>
              <td style="padding: 15px 0 5px; text-align: right; font-weight: bold;">₹${order.totalAmount - order.deliveryCharges + order.discount}</td>
            </tr>
            ${order.discount ? `
            <tr>
              <td style="padding: 5px 0; color: #8c765c;">Discount</td>
              <td style="padding: 5px 0; text-align: right; color: #8c765c;">-₹${order.discount}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 5px 0;">Delivery Charges</td>
              <td style="padding: 5px 0; text-align: right;">₹${order.deliveryCharges}</td>
            </tr>
            <tr style="border-top: 2px solid #8c765c;">
              <td style="padding: 10px 0 0; font-weight: bold; font-size: 16px;">Total Amount</td>
              <td style="padding: 10px 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #8c765c;">₹${order.totalAmount}</td>
            </tr>
          </table>
        </div>

        <div class="button-container">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/orders/${order.orderId}" class="button">Manage Order in Admin Portal</a>
        </div>
      `
    );

    for (const email of adminEmails) {
      await this.sendEmail(email, `Admin Notification: New Order Placed - ${order.orderId}`, html);
    }
  }

  /**
   * Send a new return request alert email to the store owner (admins)
   */
  async sendOwnerNewReturnAlertEmail(returnObj: any) {
    const adminEmails = await this.getAdminEmails();
    if (adminEmails.length === 0) return;

    const html = this.getLuxuryWrapper(
      'New Return Request Submitted',
      `
        <h2 class="title">New Return Requested</h2>
        <p>Dear Owner,</p>
        <p>A customer has submitted a new return request for order ID <strong>${returnObj.order}</strong>.</p>
        
        <div style="background-color: #faf8f6; padding: 20px; border: 1px solid #e5dfd9; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #8c765c; font-family: 'Playfair Display', serif;">Return Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Return ID:</td>
              <td style="padding: 5px 0; text-align: right;">${returnObj.returnId}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Reason:</td>
              <td style="padding: 5px 0; text-align: right;">${returnObj.reason}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Estimated Refund:</td>
              <td style="padding: 5px 0; text-align: right; color: #8c765c; font-weight: bold;">₹${returnObj.totalRefundAmount}</td>
            </tr>
          </table>
        </div>

        <div class="button-container">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/returns/${returnObj.returnId}" class="button">Manage Return in Admin Portal</a>
        </div>
      `
    );

    for (const email of adminEmails) {
      await this.sendEmail(email, `Admin Notification: New Return Requested - ${returnObj.returnId}`, html);
    }
  }
}
