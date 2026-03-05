import type { Drone } from "@/data/drones";
import { calcDays } from "@/lib/dateUtils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  drone: Drone;
  startDate: string;
  endDate: string;
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

function itemTotal(item: CartItem): number {
  return item.drone.dailyPrice * calcDays(item.startDate, item.endDate);
}

interface CartState {
  items: CartItem[];
  completedOrder: CompletedOrder | null;
  addItem: (drone: Drone, startDate: string, endDate: string) => void;
  removeItem: (droneId: string) => void;
  updateDates: (droneId: string, startDate: string, endDate: string) => void;
  clear: () => void;
  completeOrder: () => void;
  clearCompletedOrder: () => void;
}

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  completedOrder: null,
  addItem: (drone, startDate, endDate) =>
    set((state) => {
      const existing = state.items.find((i) => i.drone.id === drone.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.drone.id === drone.id ? { ...i, startDate, endDate } : i,
          ),
        };
      }
      return { items: [...state.items, { drone, startDate, endDate }] };
    }),
  removeItem: (droneId) =>
    set((state) => ({
      items: state.items.filter((i) => i.drone.id !== droneId),
    })),
  updateDates: (droneId, startDate, endDate) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.drone.id === droneId ? { ...i, startDate, endDate } : i,
      ),
    })),
  clear: () => set({ items: [] }),
  completeOrder: () =>
    set((state) => ({
      completedOrder: {
        orderId: generateOrderId(),
        items: state.items,
        totalPrice: state.items.reduce((sum, i) => sum + itemTotal(i), 0),
      },
      items: [],
    })),
  clearCompletedOrder: () => set({ completedOrder: null }),
}), {
  name: "skyrent-cart",
  partialize: (state) => ({ items: state.items }),
}));

export function selectTotalPrice(state: CartState): number {
  return state.items.reduce((sum, i) => sum + itemTotal(i), 0);
}

export function selectItemCount(state: CartState): number {
  return state.items.length;
}
