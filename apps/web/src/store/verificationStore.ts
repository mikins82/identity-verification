import { create } from "zustand";

export interface IdentityData {
  selfieUrl: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  score: number;
  status: "verified" | "failed";
}

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
