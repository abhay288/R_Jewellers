import { InventoryRepository } from '../repositories/InventoryRepository';

export class InventoryService {
  private repository: InventoryRepository;

  constructor() {
    this.repository = new InventoryRepository();
  }

  // TODO: Implement business logic in future phases
}
