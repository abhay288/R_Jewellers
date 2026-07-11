import { BaseRepository } from './BaseRepository';
import Wishlist from '../models/Wishlist';

export class WishlistRepository extends BaseRepository<any> {
  constructor() {
    super(Wishlist);
  }
}
