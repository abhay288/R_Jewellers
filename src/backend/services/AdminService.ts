import { AdminRepository } from '../repositories/AdminRepository';

export class AdminService {
  private repository: AdminRepository;

  constructor() {
    this.repository = new AdminRepository();
  }

  // TODO: Implement business logic in future phases
}
