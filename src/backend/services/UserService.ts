import { UserRepository } from '../repositories/UserRepository';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  // TODO: Implement business logic in future phases
}
