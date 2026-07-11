import { WishlistRepository } from '../repositories/WishlistRepository';

export class WishlistService {
  private repository: WishlistRepository;

  constructor() {
    this.repository = new WishlistRepository();
  }

  // TODO: Implement business logic in future phases
}
