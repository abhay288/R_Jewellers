import { NotificationRepository } from '../repositories/NotificationRepository';

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  // TODO: Implement business logic in future phases
}
