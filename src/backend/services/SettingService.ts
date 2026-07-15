import { SettingRepository } from '../repositories/SettingRepository';
import Setting from '../models/Setting';

export class SettingService {
  private repository: SettingRepository;

  constructor() {
    this.repository = new SettingRepository();
  }

  /**
   * Get all settings from the database, grouped by their category.
   */
  async getAllSettings() {
    const settingsList = await Setting.find({});
    const settings: Record<string, any> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });
    return settings;
  }

  /**
   * Get settings belonging to a specific group (e.g. 'general', 'payment', 'shipping', 'seo', 'ai')
   */
  async getSettingsByGroup(group: 'general' | 'payment' | 'shipping' | 'seo' | 'ai') {
    const settingsList = await Setting.find({ group });
    const settings: Record<string, any> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });
    return settings;
  }

  /**
   * Get the value of a specific setting key, falling back to a default value.
   */
  async getSettingByKey(key: string, defaultValue: any = null) {
    const setting = await Setting.findOne({ key });
    return setting ? setting.value : defaultValue;
  }

  /**
   * Update or insert settings in bulk for a group.
   */
  async updateSettings(settingsData: Record<string, any>, group: 'general' | 'payment' | 'shipping' | 'seo' | 'ai') {
    const promises = Object.entries(settingsData).map(([key, value]) => {
      return Setting.findOneAndUpdate(
        { key },
        { value, group },
        { upsert: true, new: true }
      );
    });
    await Promise.all(promises);
    return this.getSettingsByGroup(group);
  }
}
