import { CartRepository } from '../repositories/CartRepository';

export class CartService {
  private repository: CartRepository;

  constructor() {
    this.repository = new CartRepository();
  }

  // TODO: Implement business logic in future phases
}
