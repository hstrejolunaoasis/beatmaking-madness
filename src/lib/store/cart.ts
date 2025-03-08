import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (beatId: string) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.beatId === item.beatId);
          if (existingItem) {
            return state;
          }
          return {
            items: [...state.items, item],
            total: state.total + item.price,
          };
        }),
      removeItem: (beatId) =>
        set((state) => ({
          items: state.items.filter((item) => item.beatId !== beatId),
          total: state.total - (state.items.find((item) => item.beatId === beatId)?.price || 0),
        })),
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: "cart-storage",
    }
  )
); 