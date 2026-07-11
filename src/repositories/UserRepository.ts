import { BaseRepository } from './BaseRepository';
import User, { IUser } from '@/models/User';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).select('+password').exec();
  }
}

export const userRepository = new UserRepository();
