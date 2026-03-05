import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: !options.watch,
  sourcemap: true,
  treeshake: true,
  external: [
    "react",
    "react-native",
    "react-native-vision-camera",
    "react-native-svg",
  ],
}));
