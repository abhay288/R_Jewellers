import { BaseRepository } from './BaseRepository';
import ActivityLog, { IActivityLog } from '../models/ActivityLog';

export class ActivityLogRepository extends BaseRepository<IActivityLog> {
  constructor() {
    super(ActivityLog as any); // Cast as any if TS complains about Document compatibility
  }
}
