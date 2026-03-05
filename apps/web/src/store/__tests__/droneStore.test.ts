import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useDroneStore } from "../droneStore";
import { DRONES } from "@/data/drones";

function getState() {
  return useDroneStore.getState();
}

describe("droneStore", () => {
  beforeEach(() => {
    useDroneStore.setState({ drones: [], loaded: false, loading: false });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with empty state", () => {
    expect(getState().drones).toEqual([]);
    expect(getState().loaded).toBe(false);
    expect(getState().loading).toBe(false);
  });

  it("sets loading to true while fetching", async () => {
    const promise = getState().fetchDrones();
    expect(getState().loading).toBe(true);
    expect(getState().loaded).toBe(false);

    await vi.advanceTimersByTimeAsync(1500);
    await promise;
  });

  it("populates drones after fetch completes", async () => {
    const promise = getState().fetchDrones();
    await vi.advanceTimersByTimeAsync(1500);
    await promise;

    expect(getState().drones).toEqual(DRONES);
    expect(getState().loaded).toBe(true);
    expect(getState().loading).toBe(false);
  });

  it("does not re-fetch once loaded", async () => {
    const promise1 = getState().fetchDrones();
    await vi.advanceTimersByTimeAsync(1500);
    await promise1;

    const dronesBefore = getState().drones;
    await getState().fetchDrones();

    expect(getState().drones).toBe(dronesBefore);
  });

  it("does not start a second fetch while already loading", async () => {
    const promise1 = getState().fetchDrones();
    const promise2 = getState().fetchDrones();

    await vi.advanceTimersByTimeAsync(1500);
    await Promise.all([promise1, promise2]);

    expect(getState().drones).toEqual(DRONES);
    expect(getState().loaded).toBe(true);
  });
});
