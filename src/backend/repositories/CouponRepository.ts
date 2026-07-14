import { BaseRepository } from './BaseRepository';
import Coupon from '../models/Coupon';

export class CouponRepository extends BaseRepository<any> {
  constructor() {
    super(Coupon);
  }
}
