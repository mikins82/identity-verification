import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3000, open: true },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
