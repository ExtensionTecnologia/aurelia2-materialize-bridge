import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineConfig({
  test: { environment: "jsdom", watch: false, setupFiles: ["./test/setup.ts"], include: ["src/**/*.spec.ts"] }
}));
