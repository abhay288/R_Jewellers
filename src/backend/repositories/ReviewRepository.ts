import { BaseRepository } from './BaseRepository';
import Review from '../models/Review';

export class ReviewRepository extends BaseRepository<any> {
  constructor() {
    super(Review);
  }
}
