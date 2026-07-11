import { ProductRepository } from '../repositories/ProductRepository';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  // TODO: Implement business logic in future phases
}
