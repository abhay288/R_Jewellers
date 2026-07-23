import mongoose, { Model, Document } from 'mongoose';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BaseRepository<T extends Document> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(filter: Record<string, any> = {}, options?: Record<string, any>): Promise<T[]> {
    return this.model.find(filter, null, options).lean().exec() as any;
  }

  async update(id: string, data: Record<string, any>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async search(query: string, fields: string[]): Promise<T[]> {
    const filter: any = {
      $or: fields.map(field => ({
        [field]: { $regex: query, $options: 'i' }
      }))
    };
    return this.model.find(filter).lean().exec() as any;
  }

  async paginate(filter: Record<string, any> = {}, page: number = 1, limit: number = 10, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<PaginationResult<T>> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      this.model.countDocuments(filter).exec()
    ]);

    return {
      data: data as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
