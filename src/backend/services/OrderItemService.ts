import { OrderItemRepository } from '../repositories/OrderItemRepository';

export class OrderItemService {
  private repository: OrderItemRepository;

  constructor() {
    this.repository = new OrderItemRepository();
  }

  // TODO: Implement business logic in future phases
}
