import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Drone } from "@/data/drones";
import { DRONES } from "@/data/drones";

const SIMULATED_LATENCY_MS = 1500;

interface DroneState {
  drones: Drone[];
  loaded: boolean;
  loading: boolean;
  fetchDrones: () => Promise<void>;
}

export const useDroneStore = create<DroneState>()(
  persist(
    (set, get) => ({
      drones: [],
      loaded: false,
      loading: false,
      fetchDrones: async () => {
        if (get().loaded || get().loading) return;
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
        set({ drones: DRONES, loaded: true, loading: false });
      },
    }),
    {
      name: "skyrent-drones",
      partialize: (state) => ({ drones: state.drones, loaded: state.loaded }),
    },
  ),
);

