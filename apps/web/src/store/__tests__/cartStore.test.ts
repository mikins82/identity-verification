import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore, selectTotalPrice, selectItemCount } from "../cartStore";
import type { Drone } from "@/data/drones";

const filmingDrone: Drone = {
  id: "phantom-pro",
  name: "Phantom Pro X",
  category: "filming",
  dailyPrice: 89,
  image: "/drones/phantom-pro.jpg",
  description: "Test filming drone",
  specs: {
    resolution: "4K 60fps",
    stabilization: "3-axis gimbal",
    flightTime: 31,
    range: 7000,
  },
};

const cargoDrone: Drone = {
  id: "cargo-lite",
  name: "SkyMule Lite",
  category: "cargo",
  dailyPrice: 99,
  image: "/drones/cargo-lite.jpg",
  description: "Test cargo drone",
  specs: {
    maxPayload: 2,
    flightTime: 35,
    range: 10000,
    weatherResistance: "IP54",
  },
};

function getState() {
  return useCartStore.getState();
}

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  describe("addItem", () => {
    it("adds a new drone with default 1 day", () => {
      getState().addItem(filmingDrone);

      expect(getState().items).toHaveLength(1);
      expect(getState().items[0]).toEqual({ drone: filmingDrone, days: 1 });
    });

    it("adds a new drone with specified days", () => {
      getState().addItem(filmingDrone, 3);

      expect(getState().items[0].days).toBe(3);
    });

    it("increments days when adding an existing drone", () => {
      getState().addItem(filmingDrone, 2);
      getState().addItem(filmingDrone, 3);

      expect(getState().items).toHaveLength(1);
      expect(getState().items[0].days).toBe(5);
    });

    it("adds multiple different drones independently", () => {
      getState().addItem(filmingDrone, 1);
      getState().addItem(cargoDrone, 2);

      expect(getState().items).toHaveLength(2);
      expect(getState().items[0].days).toBe(1);
      expect(getState().items[1].days).toBe(2);
    });
  });

  describe("removeItem", () => {
    it("removes a drone by id", () => {
      getState().addItem(filmingDrone);
      getState().addItem(cargoDrone);
      getState().removeItem("phantom-pro");

      expect(getState().items).toHaveLength(1);
      expect(getState().items[0].drone.id).toBe("cargo-lite");
    });

    it("does nothing when removing a non-existent id", () => {
      getState().addItem(filmingDrone);
      getState().removeItem("non-existent");

      expect(getState().items).toHaveLength(1);
    });
  });

  describe("updateDays", () => {
    it("updates the rental days for a specific drone", () => {
      getState().addItem(filmingDrone, 1);
      getState().updateDays("phantom-pro", 5);

      expect(getState().items[0].days).toBe(5);
    });

    it("clamps days to minimum of 1", () => {
      getState().addItem(filmingDrone, 3);
      getState().updateDays("phantom-pro", 0);

      expect(getState().items[0].days).toBe(1);
    });

    it("clamps negative days to 1", () => {
      getState().addItem(filmingDrone, 3);
      getState().updateDays("phantom-pro", -5);

      expect(getState().items[0].days).toBe(1);
    });

    it("does not affect other items", () => {
      getState().addItem(filmingDrone, 1);
      getState().addItem(cargoDrone, 2);
      getState().updateDays("phantom-pro", 7);

      expect(getState().items[1].days).toBe(2);
    });
  });

  describe("clear", () => {
    it("removes all items from the cart", () => {
      getState().addItem(filmingDrone);
      getState().addItem(cargoDrone);
      getState().clear();

      expect(getState().items).toEqual([]);
    });
  });
});

describe("selectTotalPrice", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("returns 0 for an empty cart", () => {
    expect(selectTotalPrice(getState())).toBe(0);
  });

  it("calculates price as dailyPrice * days", () => {
    getState().addItem(filmingDrone, 3);

    expect(selectTotalPrice(getState())).toBe(89 * 3);
  });

  it("sums prices across multiple items", () => {
    getState().addItem(filmingDrone, 2);
    getState().addItem(cargoDrone, 3);

    expect(selectTotalPrice(getState())).toBe(89 * 2 + 99 * 3);
  });
});

describe("selectItemCount", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("returns 0 for an empty cart", () => {
    expect(selectItemCount(getState())).toBe(0);
  });

  it("returns the number of distinct items", () => {
    getState().addItem(filmingDrone);
    getState().addItem(cargoDrone);

    expect(selectItemCount(getState())).toBe(2);
  });

  it("does not double-count re-added drones", () => {
    getState().addItem(filmingDrone);
    getState().addItem(filmingDrone);

    expect(selectItemCount(getState())).toBe(1);
  });
});
