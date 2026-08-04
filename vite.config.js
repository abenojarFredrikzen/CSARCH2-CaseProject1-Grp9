import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Adds React support to the Vite project.
  plugins: [react()],

  // GitHub Pages hosts this app inside the repository's project folder.
  base: "/CSARCH2-CaseProject1-Grp9/",
  test: {
    // Core tests run in Node because they do not need a browser page.
    environment: "node",
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
