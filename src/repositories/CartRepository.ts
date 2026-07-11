import { BaseRepository } from './BaseRepository';
import Cart from '../models/Cart';

export class CartRepository extends BaseRepository<any> {
  constructor() {
    super(Cart);
  }
}
