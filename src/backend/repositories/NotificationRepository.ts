import { BaseRepository } from './BaseRepository';
import Notification from '../models/Notification';

export class NotificationRepository extends BaseRepository<any> {
  constructor() {
    super(Notification);
  }
}
