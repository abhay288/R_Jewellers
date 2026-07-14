import { CouponRepository } from '../repositories/CouponRepository';

export class CouponService {
  private repository: CouponRepository;

  constructor() {
    this.repository = new CouponRepository();
  }

  // TODO: Implement business logic in future phases
}
