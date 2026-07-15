import { WishlistRepository } from '../repositories/WishlistRepository';

export class WishlistService {
  private repository: WishlistRepository;

  constructor() {
    this.repository = new WishlistRepository();
  }

  async getWishlist(userId: string) {
    let wishlist = await this.repository.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await this.repository.create({ user: userId, products: [] });
    }
    return wishlist.populate('products');
  }

  async toggleItem(userId: string, productId: string) {
    let wishlist = await this.repository.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await this.repository.create({ user: userId, products: [productId as any] });
    } else {
      const index = wishlist.products.findIndex((p: any) => p.toString() === productId);
      if (index > -1) {
        // Remove item
        wishlist.products.splice(index, 1);
      } else {
        // Add item
        wishlist.products.push(productId as any);
      }
      await wishlist.save();
    }
    return wishlist.populate('products');
  }
}
