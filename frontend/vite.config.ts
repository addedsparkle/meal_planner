import { defineConfig } from "vitest/config";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tanstackRouter({ routesDirectory: "./src/routes" }), react(), tailwindcss()],
  test: {
    environment: "node",
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/docs": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
