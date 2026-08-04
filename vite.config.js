import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Adds React support to the Vite project.
  plugins: [react()],

  // Relative paths let the built site work inside a project folder.
  base: "./",
  test: {
    // Core tests run in Node because they do not need a browser page.
    environment: "node",
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
