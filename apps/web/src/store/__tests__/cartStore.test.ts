import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore, selectTotalPrice, selectItemCount, type CompletedOrder } from "../cartStore";
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
    useCartStore.setState({ items: [], completedOrder: null });
  });

  describe("addItem", () => {
    it("adds a new drone with a date range", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-04");

      expect(getState().items).toHaveLength(1);
      expect(getState().items[0]).toEqual({
        drone: filmingDrone,
        startDate: "2026-04-01",
        endDate: "2026-04-04",
      });
    });

    it("replaces dates when adding an existing drone", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-03");
      getState().addItem(filmingDrone, "2026-05-10", "2026-05-15");

      expect(getState().items).toHaveLength(1);
      expect(getState().items[0].startDate).toBe("2026-05-10");
      expect(getState().items[0].endDate).toBe("2026-05-15");
    });

    it("adds multiple different drones independently", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      getState().addItem(cargoDrone, "2026-04-01", "2026-04-04");

      expect(getState().items).toHaveLength(2);
      expect(getState().items[0].startDate).toBe("2026-04-01");
      expect(getState().items[1].endDate).toBe("2026-04-04");
    });
  });

  describe("removeItem", () => {
    it("removes a drone by id", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      getState().addItem(cargoDrone, "2026-04-01", "2026-04-03");
      getState().removeItem("phantom-pro");

      expect(getState().items).toHaveLength(1);
      expect(getState().items[0].drone.id).toBe("cargo-lite");
    });

    it("does nothing when removing a non-existent id", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      getState().removeItem("non-existent");

      expect(getState().items).toHaveLength(1);
    });
  });

  describe("updateDates", () => {
    it("updates the rental dates for a specific drone", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      getState().updateDates("phantom-pro", "2026-05-01", "2026-05-06");

      expect(getState().items[0].startDate).toBe("2026-05-01");
      expect(getState().items[0].endDate).toBe("2026-05-06");
    });

    it("does not affect other items", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      getState().addItem(cargoDrone, "2026-04-01", "2026-04-04");
      getState().updateDates("phantom-pro", "2026-06-01", "2026-06-08");

      expect(getState().items[1].startDate).toBe("2026-04-01");
      expect(getState().items[1].endDate).toBe("2026-04-04");
    });
  });

  describe("clear", () => {
    it("removes all items from the cart", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      getState().addItem(cargoDrone, "2026-04-01", "2026-04-03");
      getState().clear();

      expect(getState().items).toEqual([]);
    });
  });

  describe("completeOrder", () => {
    it("snapshots items and totalPrice into completedOrder", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-03");
      getState().addItem(cargoDrone, "2026-04-01", "2026-04-04");
      getState().completeOrder();

      const order = getState().completedOrder as CompletedOrder;
      expect(order).not.toBeNull();
      expect(order.items).toHaveLength(2);
      // 2 days * $89 + 3 days * $99
      expect(order.totalPrice).toBe(89 * 2 + 99 * 3);
      expect(order.orderId).toMatch(/^SR-.+-\w+$/);
    });

    it("clears the cart atomically", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      getState().completeOrder();

      expect(getState().items).toEqual([]);
    });

    it("generates a unique orderId", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      getState().completeOrder();
      const first = getState().completedOrder!.orderId;

      useCartStore.setState({ items: [], completedOrder: null });
      getState().addItem(cargoDrone, "2026-04-01", "2026-04-03");
      getState().completeOrder();
      const second = getState().completedOrder!.orderId;

      expect(first).not.toBe(second);
    });
  });

  describe("clearCompletedOrder", () => {
    it("resets completedOrder to null", () => {
      getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      getState().completeOrder();
      expect(getState().completedOrder).not.toBeNull();

      getState().clearCompletedOrder();
      expect(getState().completedOrder).toBeNull();
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

  it("calculates price as dailyPrice * days from date range", () => {
    getState().addItem(filmingDrone, "2026-04-01", "2026-04-04");

    expect(selectTotalPrice(getState())).toBe(89 * 3);
  });

  it("sums prices across multiple items", () => {
    getState().addItem(filmingDrone, "2026-04-01", "2026-04-03");
    getState().addItem(cargoDrone, "2026-04-01", "2026-04-04");

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
    getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
    getState().addItem(cargoDrone, "2026-04-01", "2026-04-03");

    expect(selectItemCount(getState())).toBe(2);
  });

  it("does not double-count re-added drones", () => {
    getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
    getState().addItem(filmingDrone, "2026-04-05", "2026-04-07");

    expect(selectItemCount(getState())).toBe(1);
  });
});
