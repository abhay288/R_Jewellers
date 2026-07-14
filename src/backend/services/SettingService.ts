import { SettingRepository } from '../repositories/SettingRepository';

export class SettingService {
  private repository: SettingRepository;

  constructor() {
    this.repository = new SettingRepository();
  }

  // TODO: Implement business logic in future phases
}
