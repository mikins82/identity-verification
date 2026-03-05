import type { Drone } from "@/data/drones";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  drone: Drone;
  days: number;
}

export interface CompletedOrder {
  orderId: string;
  items: CartItem[];
  totalPrice: number;
}

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SR-${timestamp}-${random}`;
}

interface CartState {
  items: CartItem[];
  completedOrder: CompletedOrder | null;
  addItem: (drone: Drone, days?: number) => void;
  removeItem: (droneId: string) => void;
  updateDays: (droneId: string, days: number) => void;
  clear: () => void;
  completeOrder: () => void;
  clearCompletedOrder: () => void;
}

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  completedOrder: null,
  addItem: (drone, days = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.drone.id === drone.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.drone.id === drone.id ? { ...i, days: i.days + days } : i,
          ),
        };
      }
      return { items: [...state.items, { drone, days }] };
    }),
  removeItem: (droneId) =>
    set((state) => ({
      items: state.items.filter((i) => i.drone.id !== droneId),
    })),
  updateDays: (droneId, days) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.drone.id === droneId ? { ...i, days: Math.max(1, days) } : i,
      ),
    })),
  clear: () => set({ items: [] }),
  completeOrder: () =>
    set((state) => ({
      completedOrder: {
        orderId: generateOrderId(),
        items: state.items,
        totalPrice: state.items.reduce(
          (sum, i) => sum + i.drone.dailyPrice * i.days,
          0,
        ),
      },
      items: [],
    })),
  clearCompletedOrder: () => set({ completedOrder: null }),
}), {
  name: "skyrent-cart",
  partialize: (state) => ({ items: state.items }),
}));

export function selectTotalPrice(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.drone.dailyPrice * i.days, 0);
}

export function selectItemCount(state: CartState): number {
  return state.items.length;
}
