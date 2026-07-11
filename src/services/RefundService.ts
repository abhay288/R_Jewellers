import { RefundRepository } from '../repositories/RefundRepository';

export class RefundService {
  private repository: RefundRepository;

  constructor() {
    this.repository = new RefundRepository();
  }

  // TODO: Implement business logic in future phases
}
