import { ProductRepository } from '../repositories/ProductRepository';
import { ActivityLogRepository } from '../repositories/ActivityLogRepository';
import { InventoryHistoryService } from './InventoryHistoryService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import User from '../models/User';
import mongoose from 'mongoose';
import { IProduct } from '../models/Product';
import { IInventoryHistory } from '../models/InventoryHistory';

export class ProductService {
  private repository: ProductRepository;
  private activityLogRepository: ActivityLogRepository;
  private inventoryHistoryService: InventoryHistoryService;
  private notificationRepository: NotificationRepository;

  constructor() {
    this.repository = new ProductRepository();
    this.activityLogRepository = new ActivityLogRepository();
    this.inventoryHistoryService = new InventoryHistoryService();
    this.notificationRepository = new NotificationRepository();
  }

  async getInventoryDashboardStats() {
    const totalProducts = await this.repository.findAll({});
    const lowStock = totalProducts.filter(p => p.stock > 0 && p.stock <= p.minimumStock).length;
    const outOfStock = totalProducts.filter(p => p.stock === 0).length;
    
    // Inventory value based on finalPrice * stock
    const inventoryValue = totalProducts.reduce((acc, p) => acc + (p.finalPrice * p.stock), 0);

    return {
      totalProducts: totalProducts.length,
      lowStock,
      outOfStock,
      inventoryValue
    };
  }

  async adjustStock(
    productId: string, 
    changeQuantity: number, 
    reason: IInventoryHistory['reason'], 
    userId?: string, 
    notes?: string
  ) {
    const product = await this.repository.findById(productId);
    if (!product) throw new Error('Product not found');

    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + changeQuantity);

    // Update product stock and status
    product.stock = newStock;
    if (newStock === 0) {
      product.status = 'Out Of Stock';
    } else if (product.status === 'Out Of Stock' && newStock > 0) {
      product.status = 'Published'; // Or 'Draft' depending on previous state
    }
    await product.save();

    // Log history
    await this.inventoryHistoryService.logChange({
      product: productId,
      previousStock,
      newStock,
      changeQuantity,
      reason,
      userId,
      notes
    });

    // Activity log
    await this.activityLogRepository.create({
      user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      action: 'Stock Updated',
      entityType: 'Product',
      entityId: product._id as mongoose.Types.ObjectId,
      details: { productName: product.name, previousStock, newStock, reason }
    });

    // Check for low stock alert
    if (newStock > 0 && newStock <= product.minimumStock) {
      await this.createLowStockAlert(product);
    }

    return product;
  }

  private async createLowStockAlert(product: IProduct) {
    // Find all admins
    const admins = await User.find({ role: 'admin' }).select('_id').exec();
    
    const notifications = admins.map(admin => ({
      user: admin._id,
      title: 'Low Stock Alert',
      message: `Product "${product.name}" (SKU: ${product.sku || 'N/A'}) is running low on stock. Only ${product.stock} left.`,
      type: 'system',
      link: `/admin/inventory`
    }));

    if (notifications.length > 0) {
      // Create notifications for all admins
      const NotificationModel = mongoose.models.Notification;
      await NotificationModel.insertMany(notifications);
    }
  }

  async getProductsForInventory(filter: Record<string, any> = {}, page: number = 1, limit: number = 20) {
    return this.repository.paginate(filter, page, limit, { createdAt: -1 });
  }

  // --- Storefront Methods ---

  async getStorefrontProducts(filters: Record<string, any> = {}, sort: string = 'newest', page: number = 1, limit: number = 12) {
    const query: Record<string, any> = { isActive: true, status: { $ne: 'Draft' } };

    if (filters.category && filters.category !== 'All') {
      if (mongoose.Types.ObjectId.isValid(filters.category)) {
        query.category = filters.category;
      } else {
        // Look up category by slug or name
        const CategoryModel = mongoose.models.Category;
        if (CategoryModel) {
            const cat = await CategoryModel.findOne({
                $or: [{ slug: filters.category }, { name: { $regex: new RegExp(`^${filters.category}$`, 'i') } }]
            });
            if (cat) {
                query.category = cat._id;
            } else {
                // Return empty if category doesn't exist
                return { data: [], total: 0, page, limit, totalPages: 0 };
            }
        }
      }
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { tags: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case 'price-low': sortQuery = { price: 1 }; break;
      case 'price-high': sortQuery = { price: -1 }; break;
      case 'popularity': sortQuery = { viewCount: -1 }; break;
      case 'featured': sortQuery = { isFeatured: -1, createdAt: -1 }; break;
      case 'newest':
      default: sortQuery = { createdAt: -1 }; break;
    }

    return this.repository.paginate(query, page, limit, sortQuery);
  }

  async getProductBySlug(slug: string) {
    return this.repository.findOne({ slug, isActive: true });
  }

  async getProductById(id: string) {
    return this.repository.findById(id);
  }

  async getRelatedProducts(productId: string, limit: number = 4) {
    const product = await this.repository.findById(productId);
    if (!product) return [];
    
    // Simple heuristic: same category, active, not the same product
    return this.repository.findAll({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    }, { limit, sort: { viewCount: -1 } });
  }

  async getFeaturedProducts(limit: number = 8) {
    return this.repository.findAll({ isActive: true, isFeatured: true }, { limit, sort: { createdAt: -1 } });
  }

  async getTrendingProducts(limit: number = 8) {
    return this.repository.findAll({ isActive: true, isTrending: true }, { limit, sort: { createdAt: -1 } });
  }

  async getBestSellers(limit: number = 8) {
    return this.repository.findAll({ isActive: true, isBestSeller: true }, { limit, sort: { createdAt: -1 } });
  }

  async getNewArrivals(limit: number = 8) {
    return this.repository.findAll({ isActive: true }, { limit, sort: { createdAt: -1 } });
  }
}

