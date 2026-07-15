import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // Product ID
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isSynced: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  setSynced: (synced: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      isSynced: false, // Tracks if this cart has been merged with DB upon login
      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, newItem], isOpen: true };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items }),
      setSynced: (synced) => set({ isSynced: synced }),
    }),
    {
      name: "radhika-cart-storage",
      partialize: (state) => ({ items: state.items }), // Only persist items to localStorage
    }
  )
);

