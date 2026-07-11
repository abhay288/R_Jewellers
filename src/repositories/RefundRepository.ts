import { BaseRepository } from './BaseRepository';
import Refund from '../models/Refund';

export class RefundRepository extends BaseRepository<any> {
  constructor() {
    super(Refund);
  }
}
