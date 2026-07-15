import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedStore {
  items: any[]; // Array of product objects (last 10)
  addItem: (product: any) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          if (!product || !product._id) return state;
          const newItems = state.items.filter((item) => item._id !== product._id); // Remove if exists
          newItems.unshift(product); // Add to front
          if (newItems.length > 10) {
            newItems.pop(); // Keep max 10
          }
          return { items: newItems };
        }),
    }),
    {
      name: "radhika-recently-viewed",
    }
  )
);
