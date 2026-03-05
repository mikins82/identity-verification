import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/web.ts", "src/react-native.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: !options.watch,
  sourcemap: true,
  treeshake: true,
}));
