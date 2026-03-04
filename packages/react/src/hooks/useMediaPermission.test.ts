import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useMediaPermission } from "./useMediaPermission";

function mockPermissions(initialState: string) {
  const listeners: Array<() => void> = [];
  const permissionStatus = {
    state: initialState,
    addEventListener: vi.fn((_event: string, handler: () => void) => {
      listeners.push(handler);
    }),
    removeEventListener: vi.fn(),
  };

  Object.defineProperty(navigator, "permissions", {
    value: { query: vi.fn().mockResolvedValue(permissionStatus) },
    writable: true,
    configurable: true,
  });

  return {
    permissionStatus,
    fireChange(newState: string) {
      permissionStatus.state = newState;
      listeners.forEach((fn) => fn());
    },
  };
}

describe("useMediaPermission", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, "mediaDevices", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "permissions", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("returns 'unavailable' when navigator.mediaDevices is absent", () => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useMediaPermission());
    expect(result.current).toBe("unavailable");
  });

  it("returns 'prompt' as initial state when mediaDevices exists", () => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: vi.fn() },
      writable: true,
      configurable: true,
    });
    mockPermissions("prompt");

    const { result } = renderHook(() => useMediaPermission());
    expect(result.current).toBe("prompt");
  });

  it("resolves to 'granted' when permission is already granted", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: vi.fn() },
      writable: true,
      configurable: true,
    });
    mockPermissions("granted");

    const { result } = renderHook(() => useMediaPermission());

    await waitFor(() => {
      expect(result.current).toBe("granted");
    });
  });

  it("resolves to 'denied' when permission was previously denied", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: vi.fn() },
      writable: true,
      configurable: true,
    });
    mockPermissions("denied");

    const { result } = renderHook(() => useMediaPermission());

    await waitFor(() => {
      expect(result.current).toBe("denied");
    });
  });

  it("updates when permission state changes via subscription", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: vi.fn() },
      writable: true,
      configurable: true,
    });
    const { fireChange } = mockPermissions("prompt");

    const { result } = renderHook(() => useMediaPermission());

    await waitFor(() => {
      expect(result.current).toBe("prompt");
    });

    fireChange("granted");

    await waitFor(() => {
      expect(result.current).toBe("granted");
    });
  });

  it("does not update state after unmount", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: vi.fn() },
      writable: true,
      configurable: true,
    });
    mockPermissions("prompt");

    const { result, unmount } = renderHook(() => useMediaPermission());
    unmount();

    expect(result.current).toBe("prompt");
  });
});
