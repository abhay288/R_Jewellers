import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedStore {
  items: string[]; // Array of product IDs (last 20)
  addItem: (id: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((itemId) => itemId !== id); // Remove if exists
          newItems.unshift(id); // Add to front
          if (newItems.length > 20) {
            newItems.pop(); // Keep max 20
          }
          return { items: newItems };
        }),
    }),
    {
      name: "radhika-recently-viewed",
    }
  )
);
