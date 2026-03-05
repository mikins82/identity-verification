import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/core",
  "packages/headless",
  "packages/react",
  "apps/web",
]);
