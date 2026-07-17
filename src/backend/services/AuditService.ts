import AuditLog from '../models/AuditLog';
import logger from '@/shared/lib/logger';
import mongoose from 'mongoose';

export class AuditService {
  /**
   * Logs a security or administrative action to the AuditLog collection and Winston logs.
   */
  static async logAction(params: {
    userId?: string | mongoose.Types.ObjectId;
    action: string;
    details: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      const sanitizedDetails = this.maskSensitiveData(params.details);

      await AuditLog.create({
        user: params.userId,
        action: params.action,
        details: sanitizedDetails,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      logger.info(`Audit Log [${params.action}] by ${params.userId || 'System'} | Details: ${JSON.stringify(sanitizedDetails)}`);
    } catch (error) {
      logger.error('Failed to create DB Audit Log entry:', error);
    }
  }

  /**
   * Traverses object and replaces sensitive credential fields.
   */
  private static maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item));
    }

    const masked: any = {};
    const sensitiveKeys = [
      'password', 'token', 'secret', 'cvv', 'pin', 'card', 
      'razorpay_signature', 'signature', 'key', 'session'
    ];

    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        masked[key] = '***MASKED***';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }
}
