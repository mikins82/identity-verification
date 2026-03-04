import { create } from "zustand";
import type { IdentityData } from "@identity-verification/core";

export type { IdentityData } from "@identity-verification/core";

interface VerificationState {
  identityData: IdentityData | null;
  setIdentityData: (data: IdentityData) => void;
  reset: () => void;
}

export const useVerificationStore = create<VerificationState>()((set) => ({
  identityData: null,
  setIdentityData: (data) => set({ identityData: data }),
  reset: () => set({ identityData: null }),
}));

export function selectIsVerified(state: VerificationState): boolean {
  return state.identityData?.status === "verified";
}
