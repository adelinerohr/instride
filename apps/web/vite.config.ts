import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), tanstackRouter({}), react(), devtools()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@instride/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
    dedupe: ["@tanstack/react-query", "react", "react-dom"],
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ["@instride/shared"],
  },
});
