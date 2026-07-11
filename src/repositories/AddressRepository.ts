import { BaseRepository } from './BaseRepository';
import Address from '../models/Address';

export class AddressRepository extends BaseRepository<any> {
  constructor() {
    super(Address);
  }
}
