import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "encore-toolbar-dev-only",
      apply: "serve", // only runs in `vite dev`, not in `vite build`
      transformIndexHtml(html) {
        return html.replace(
          "<!--encore-toolbar-->",
          '<script src="https://encore.dev/encore-toolbar.js"></script>'
        );
      },
    },
    tailwindcss(),
    tanstackRouter({}),
    react(),
    devtools(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@instride/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@instride/api": path.resolve(__dirname, "../../packages/api/src"),
    },
    dedupe: ["@tanstack/react-query", "react", "react-dom"],
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ["@instride/shared", "@instride/api"],
  },
});
