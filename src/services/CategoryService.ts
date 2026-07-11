import { CategoryRepository } from '../repositories/CategoryRepository';

export class CategoryService {
  private repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  // TODO: Implement business logic in future phases
}
