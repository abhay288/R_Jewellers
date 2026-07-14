import { BaseRepository } from './BaseRepository';
import Order from '../models/Order';

export class OrderRepository extends BaseRepository<any> {
  constructor() {
    super(Order);
  }
}
