import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react({ jsxRuntime: "automatic" }),
    dts({ rollupTypes: false, exclude: ["**/*.test.tsx", "**/*.test.ts", "**/test-setup.ts"] }),
  ],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
      generateScopedName: "iv-[local]-[hash:base64:5]",
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    cssFileName: "styles",
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "@identity-verification/core"],
    },
  },
});
