import { OrderRepository } from '../repositories/OrderRepository';

export class OrderService {
  private repository: OrderRepository;

  constructor() {
    this.repository = new OrderRepository();
  }

  // TODO: Implement business logic in future phases
}
