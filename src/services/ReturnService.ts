import { ReturnRepository } from '../repositories/ReturnRepository';

export class ReturnService {
  private repository: ReturnRepository;

  constructor() {
    this.repository = new ReturnRepository();
  }

  // TODO: Implement business logic in future phases
}
