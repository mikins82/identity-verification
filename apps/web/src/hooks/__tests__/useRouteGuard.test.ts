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
      useCartStore.getState().addItem(filmingDrone);

      const { result } = renderHook(() =>
        useRouteGuard({ requireCart: true }),
      );

      expect(result.current).toBe(true);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("requireCartNavigation", () => {
    it("redirects to /cart when location.state.fromCart is missing", () => {
      useCartStore.getState().addItem(filmingDrone);
      mockLocationState = {};

      const { result } = renderHook(() =>
        useRouteGuard({ requireCartNavigation: true }),
      );

      expect(result.current).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/cart", { replace: true });
    });

    it("allows access when fromCart flag is present", () => {
      useCartStore.getState().addItem(filmingDrone);
      mockLocationState = { fromCart: true };

      const { result } = renderHook(() =>
        useRouteGuard({ requireCartNavigation: true }),
      );

      expect(result.current).toBe(true);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("requireVerified", () => {
    it("redirects to /verify when user is not verified", () => {
      useCartStore.getState().addItem(filmingDrone);

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
      useCartStore.getState().addItem(filmingDrone);
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
      useCartStore.getState().addItem(filmingDrone);
      mockLocationState = {};

      const { result } = renderHook(() =>
        useRouteGuard({
          requireCartNavigation: true,
          requireVerified: true,
        }),
      );

      expect(result.current).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/cart", { replace: true });
    });

    it("passes all guards when all conditions are met", () => {
      useCartStore.getState().addItem(filmingDrone);
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
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("returns true when no guards are specified", () => {
    const { result } = renderHook(() => useRouteGuard({}));

    expect(result.current).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
