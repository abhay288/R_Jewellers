import { ActivityLogRepository } from '../repositories/ActivityLogRepository';
import mongoose from 'mongoose';

export class ActivityLogService {
  private repository: ActivityLogRepository;

  constructor() {
    this.repository = new ActivityLogRepository();
  }

  async logAction(
    action: string,
    entityType: string,
    entityId?: string | mongoose.Types.ObjectId,
    userId?: string | mongoose.Types.ObjectId,
    details?: any,
    ipAddress?: string
  ) {
    try {
      await this.repository.create({
        action,
        entityType,
        entityId: entityId && mongoose.Types.ObjectId.isValid(String(entityId)) ? new mongoose.Types.ObjectId(String(entityId)) : undefined,
        user: userId && mongoose.Types.ObjectId.isValid(String(userId)) ? new mongoose.Types.ObjectId(String(userId)) : undefined,
        details,
        ipAddress
      });
    } catch (error) {
      console.error('Failed to write activity log:', error);
      // We don't throw here to avoid failing the main request if logging fails
    }
  }

  async getRecentLogs(limit = 10) {
    return this.repository.paginate({}, 1, limit, { createdAt: -1 });
  }
}
