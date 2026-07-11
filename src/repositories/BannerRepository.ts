import { BaseRepository } from './BaseRepository';
import Banner from '../models/Banner';

export class BannerRepository extends BaseRepository<any> {
  constructor() {
    super(Banner);
  }
}
