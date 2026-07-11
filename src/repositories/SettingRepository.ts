import { BaseRepository } from './BaseRepository';
import Setting from '../models/Setting';

export class SettingRepository extends BaseRepository<any> {
  constructor() {
    super(Setting);
  }
}
