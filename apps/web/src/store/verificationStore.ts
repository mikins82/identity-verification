import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { IdentityData } from "@identity-verification/core";

export type { IdentityData } from "@identity-verification/core";

interface VerificationState {
  identityData: IdentityData | null;
  setIdentityData: (data: IdentityData) => void;
  reset: () => void;
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      identityData: null,
      setIdentityData: (data) => set({ identityData: data }),
      reset: () => set({ identityData: null }),
    }),
    {
      name: "skyrent-verification",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export function selectIsVerified(state: VerificationState): boolean {
  return state.identityData?.status === "verified";
}
