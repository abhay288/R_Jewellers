import { BannerRepository } from '../repositories/BannerRepository';

export class BannerService {
  private repository: BannerRepository;

  constructor() {
    this.repository = new BannerRepository();
  }

  // TODO: Implement business logic in future phases
}
