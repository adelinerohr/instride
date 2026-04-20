/// <reference types="vitest" />

import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~encore": path.resolve(__dirname, "./encore.gen"),
    },
  },
  test: {
    fileParallelism: false,
  },
});
