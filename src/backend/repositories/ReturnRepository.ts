import { BaseRepository } from './BaseRepository';
import Return from '../models/Return';

export class ReturnRepository extends BaseRepository<any> {
  constructor() {
    super(Return);
  }
}
