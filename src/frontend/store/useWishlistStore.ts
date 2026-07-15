import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[]; // Array of product IDs
  isSynced: boolean;
  toggleItem: (id: string) => void;
  setItems: (items: string[]) => void;
  setSynced: (synced: boolean) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => ({
      items: [],
      isSynced: false,
      toggleItem: (id) =>
        set((state) => ({
          items: state.items.includes(id)
            ? state.items.filter((itemId) => itemId !== id)
            : [...state.items, id],
        })),
      setItems: (items) => set({ items }),
      setSynced: (synced) => set({ isSynced: synced }),
    }),
    {
      name: "radhika-wishlist-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
