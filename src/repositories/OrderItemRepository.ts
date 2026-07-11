import { BaseRepository } from './BaseRepository';
import OrderItem from '../models/OrderItem';

export class OrderItemRepository extends BaseRepository<any> {
  constructor() {
    super(OrderItem);
  }
}
