import { ReviewRepository } from '../repositories/ReviewRepository';

export class ReviewService {
  private repository: ReviewRepository;

  constructor() {
    this.repository = new ReviewRepository();
  }

  // TODO: Implement business logic in future phases
}
