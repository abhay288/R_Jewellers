import { BaseRepository } from './BaseRepository';
import Inventory from '../models/Inventory';

export class InventoryRepository extends BaseRepository<any> {
  constructor() {
    super(Inventory);
  }
}
