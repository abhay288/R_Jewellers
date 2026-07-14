import { AddressRepository } from '../repositories/AddressRepository';

export class AddressService {
  private repository: AddressRepository;

  constructor() {
    this.repository = new AddressRepository();
  }

  // TODO: Implement business logic in future phases
}
