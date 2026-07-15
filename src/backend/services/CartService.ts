import { CartRepository } from '../repositories/CartRepository';

export class CartService {
  private repository: CartRepository;

  constructor() {
    this.repository = new CartRepository();
  }

  async getCart(userId: string) {
    let cart = await this.repository.findOne({ user: userId });
    if (!cart) {
      cart = await this.repository.create({ user: userId, items: [] });
    }
    // Populate products
    return cart.populate('items.product');
  }

  async syncCart(userId: string, items: { product: string, quantity: number }[]) {
    let cart = await this.repository.findOne({ user: userId });
    if (!cart) {
      cart = await this.repository.create({ user: userId, items: [] });
    }
    
    // We sum up the quantities if the product already exists, otherwise add it.
    // This handles the merge from guest cart.
    for (const item of items) {
      const existingItemIndex = cart.items.findIndex(i => i.product.toString() === item.product);
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += item.quantity;
      } else {
        cart.items.push({ product: item.product as any, quantity: item.quantity });
      }
    }
    
    await cart.save();
    return cart.populate('items.product');
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    let cart = await this.repository.findOne({ user: userId });
    if (!cart) {
        if(quantity > 0) {
           cart = await this.repository.create({ user: userId, items: [{ product: productId as any, quantity }] });
        } else {
            return null;
        }
    } else {
        const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
        } else if (quantity > 0) {
            cart.items.push({ product: productId as any, quantity });
        }
        await cart.save();
    }
    return cart.populate('items.product');
  }

  async removeItem(userId: string, productId: string) {
    return this.updateItemQuantity(userId, productId, 0);
  }

  async clearCart(userId: string) {
    const cart = await this.repository.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  }
}
