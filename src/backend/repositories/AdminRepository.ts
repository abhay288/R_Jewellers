import { BaseRepository } from './BaseRepository';
import Admin from '../models/Admin';

export class AdminRepository extends BaseRepository<any> {
  constructor() {
    super(Admin);
  }
}
