import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import aurelia from "@aurelia/vite-plugin";

// Library build. The demo app has its own config (vite.demo.config.ts).
export default defineConfig({
  resolve: {
    alias: [
      { find: "aurelia2-materialize-bridge/validation", replacement: fileURLToPath(new URL("./src/validation/index.ts", import.meta.url)) },
      { find: "aurelia2-materialize-bridge", replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)) }
    ]
  },
  esbuild: { target: "es2022" },
  plugins: [aurelia({ include: ["src/**/*.{ts,html}", "demo/**/*.{ts,html}"] })],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        validation: "src/validation/index.ts"
      },
      formats: ["es"]
    },
    rollupOptions: {
      // Aurelia and Materialize come from the consuming system.
      external: [/^aurelia$/, /^@aurelia\//, /^@materializecss\//]
    }
  }
});
