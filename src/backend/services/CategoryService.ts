import { CategoryRepository } from '../repositories/CategoryRepository';
import { ActivityLogRepository } from '../repositories/ActivityLogRepository';
import { ICategory } from '../models/Category';
import mongoose from 'mongoose';

export class CategoryService {
  private repository: CategoryRepository;
  private activityLogRepository: ActivityLogRepository;

  constructor() {
    this.repository = new CategoryRepository();
    this.activityLogRepository = new ActivityLogRepository();
  }

  // Helper to generate a unique slug
  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let count = 1;
    
    while (true) {
      const existing = await this.repository.findOne({ slug });
      if (!existing || (excludeId && existing._id.toString() === excludeId)) {
        break;
      }
      slug = `${baseSlug}-${count}`;
      count++;
    }
    return slug;
  }

  async createCategory(data: Partial<ICategory>, userId?: string) {
    if (data.name) {
      data.slug = await this.generateUniqueSlug(data.name);
    }
    
    // Level calculation
    if (data.parentCategory) {
      const parent = await this.repository.findById(data.parentCategory.toString());
      data.level = parent ? parent.level + 1 : 0;
    } else {
      data.level = 0;
    }

    const category = await this.repository.create(data);
    
    await this.activityLogRepository.create({
      user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      action: 'Category Created',
      entityType: 'Category',
      entityId: category._id as mongoose.Types.ObjectId,
      details: { name: category.name }
    });

    return category;
  }

  async updateCategory(id: string, data: Partial<ICategory>, userId?: string) {
    if (data.name) {
      data.slug = await this.generateUniqueSlug(data.name, id);
    }

    if (data.parentCategory !== undefined) {
      if (data.parentCategory) {
        const parent = await this.repository.findById(data.parentCategory.toString());
        data.level = parent ? parent.level + 1 : 0;
      } else {
        data.level = 0;
      }
    }

    const category = await this.repository.update(id, data);

    if (category) {
      await this.activityLogRepository.create({
        user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        action: 'Category Updated',
        entityType: 'Category',
        entityId: category._id as mongoose.Types.ObjectId,
        details: { name: category.name }
      });
    }

    return category;
  }

  async softDeleteCategory(id: string, userId?: string) {
    const category = await this.repository.update(id, { 
      isDeleted: true, 
      deletedAt: new Date() 
    });

    if (category) {
      await this.activityLogRepository.create({
        user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        action: 'Category Deleted',
        entityType: 'Category',
        entityId: category._id as mongoose.Types.ObjectId,
        details: { name: category.name }
      });
    }
    return category;
  }

  async restoreCategory(id: string, userId?: string) {
    const category = await this.repository.update(id, { 
      isDeleted: false,
      $unset: { deletedAt: 1 }
    });

    if (category) {
      await this.activityLogRepository.create({
        user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        action: 'Category Restored',
        entityType: 'Category',
        entityId: category._id as mongoose.Types.ObjectId,
        details: { name: category.name }
      });
    }
    return category;
  }

  async getCategories(filter: Record<string, any> = {}) {
    return this.repository.findAll({ isDeleted: false, ...filter }, { sort: { displayOrder: 1, createdAt: -1 } });
  }

  async getCategoryTree() {
    const categories = await this.getCategories();
    // Build tree logic
    const categoryMap = new Map();
    const tree: any[] = [];

    categories.forEach(cat => {
      categoryMap.set(cat._id.toString(), { ...cat.toObject(), children: [] });
    });

    categoryMap.forEach(cat => {
      if (cat.parentCategory) {
        const parent = categoryMap.get(cat.parentCategory.toString());
        if (parent) {
          parent.children.push(cat);
        } else {
          tree.push(cat);
        }
      } else {
        tree.push(cat);
      }
    });

    return tree;
  }

  async bulkUpdate(ids: string[], updateData: Partial<ICategory>, userId?: string) {
    const promises = ids.map(id => this.updateCategory(id, updateData, userId));
    return Promise.all(promises);
  }

  async updateDisplayOrder(items: { id: string, displayOrder: number }[], userId?: string) {
    const promises = items.map(item => this.repository.update(item.id, { displayOrder: item.displayOrder }));
    const result = await Promise.all(promises);
    
    await this.activityLogRepository.create({
      user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      action: 'Category Order Updated',
      entityType: 'Category',
      details: { itemsUpdated: items.length }
    });
    
    return result;
  }
}

