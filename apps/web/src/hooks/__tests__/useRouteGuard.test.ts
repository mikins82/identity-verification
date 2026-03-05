import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRouteGuard } from "../useRouteGuard";
import { useCartStore } from "@/store/cartStore";
import { useVerificationStore } from "@/store/verificationStore";
import type { IdentityData } from "@identity-verification/core";

const mockNavigate = vi.fn();
let mockLocationState: Record<string, unknown> = {};

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: mockLocationState,
    pathname: "/checkout",
    search: "",
  }),
}));

const filmingDrone = {
  id: "phantom-pro",
  name: "Phantom Pro X",
  category: "filming" as const,
  dailyPrice: 89,
  image: "/drones/phantom-pro.jpg",
  description: "Test",
  specs: {
    resolution: "4K 60fps",
    stabilization: "3-axis gimbal",
    flightTime: 31,
    range: 7000,
  },
};

const verifiedIdentity: IdentityData = {
  selfieUrl: "data:image/png;base64,abc",
  phone: "+14155552671",
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    country: "US",
    postalCode: "94105",
  },
  score: 85,
  status: "verified",
};

describe("useRouteGuard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocationState = {};
    useCartStore.setState({ items: [] });
    useVerificationStore.setState({ identityData: null });
  });

  describe("requireCart", () => {
    it("redirects to / when cart is empty", () => {
      const { result } = renderHook(() =>
        useRouteGuard({ requireCart: true }),
      );

      expect(result.current).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });

    it("allows access when cart has items", () => {
      useCartStore.getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");

      const { result } = renderHook(() =>
        useRouteGuard({ requireCart: true }),
      );

      expect(result.current).toBe(true);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("requireCartNavigation", () => {
    it("redirects to / when location.state.fromCart is missing", () => {
      useCartStore.getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      mockLocationState = {};

      const { result } = renderHook(() =>
        useRouteGuard({ requireCartNavigation: true }),
      );

      expect(result.current).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });

    it("allows access when fromCart flag is present", () => {
      useCartStore.getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      mockLocationState = { fromCart: true };

      const { result } = renderHook(() =>
        useRouteGuard({ requireCartNavigation: true }),
      );

      expect(result.current).toBe(true);
      expect(mockNavigate).not.toHaveBeenCalledWith("/", expect.anything());
      expect(mockNavigate).not.toHaveBeenCalledWith("/cart", expect.anything());
    });

    it("consumes fromCart from history state so it does not survive a reload", () => {
      useCartStore.getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      mockLocationState = { fromCart: true };

      renderHook(() => useRouteGuard({ requireCartNavigation: true }));

      expect(mockNavigate).toHaveBeenCalledWith("/checkout", {
        replace: true,
        state: undefined,
      });
    });

    it("preserves other state keys when consuming fromCart", () => {
      useCartStore.getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      mockLocationState = { fromCart: true, verifyPath: "/verify" };

      renderHook(() => useRouteGuard({ requireCartNavigation: true }));

      expect(mockNavigate).toHaveBeenCalledWith("/checkout", {
        replace: true,
        state: { verifyPath: "/verify" },
      });
    });
  });

  describe("requireVerified", () => {
    it("redirects to /verify when user is not verified", () => {
      useCartStore.getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");

      const { result } = renderHook(() =>
        useRouteGuard({ requireVerified: true }),
      );

      expect(result.current).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/verify", {
        replace: true,
        state: { fromCart: true },
      });
    });

    it("allows access when user is verified", () => {
      useCartStore.getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      useVerificationStore.getState().setIdentityData(verifiedIdentity);

      const { result } = renderHook(() =>
        useRouteGuard({ requireVerified: true }),
      );

      expect(result.current).toBe(true);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("combined guards", () => {
    it("requireCart takes priority over requireVerified", () => {
      const { result } = renderHook(() =>
        useRouteGuard({ requireCart: true, requireVerified: true }),
      );

      expect(result.current).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });

    it("requireCartNavigation takes priority over requireVerified when cart is non-empty", () => {
      useCartStore.getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      mockLocationState = {};

      const { result } = renderHook(() =>
        useRouteGuard({
          requireCartNavigation: true,
          requireVerified: true,
        }),
      );

      expect(result.current).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });

    it("passes all guards when all conditions are met", () => {
      useCartStore.getState().addItem(filmingDrone, "2026-04-01", "2026-04-02");
      useVerificationStore.getState().setIdentityData(verifiedIdentity);
      mockLocationState = { fromCart: true };

      const { result } = renderHook(() =>
        useRouteGuard({
          requireCart: true,
          requireCartNavigation: true,
          requireVerified: true,
        }),
      );

      expect(result.current).toBe(true);
      expect(mockNavigate).not.toHaveBeenCalledWith("/", expect.anything());
      expect(mockNavigate).not.toHaveBeenCalledWith("/cart", expect.anything());
      expect(mockNavigate).not.toHaveBeenCalledWith("/verify", expect.anything());
    });
  });

  it("returns true when no guards are specified", () => {
    const { result } = renderHook(() => useRouteGuard({}));

    expect(result.current).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
