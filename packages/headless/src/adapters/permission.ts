export type PermissionState = "prompt" | "granted" | "denied" | "unavailable";

export interface PermissionAdapter {
  query(): Promise<PermissionState>;
  subscribe(cb: (state: PermissionState) => void): () => void;
}
