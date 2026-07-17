import { BaseRepository } from './BaseRepository';
import ContactMessage from '../models/ContactMessage';

export class ContactMessageRepository extends BaseRepository<any> {
  constructor() {
    super(ContactMessage);
  }
}
