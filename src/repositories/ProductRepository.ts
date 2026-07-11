import { BaseRepository } from './BaseRepository';
import Product from '../models/Product';

export class ProductRepository extends BaseRepository<any> {
  constructor() {
    super(Product);
  }
}
