import { defineConfig, mergeConfig } from "vite";
import libraryConfig from "./vite.config";

// Demo app: a catalogue of the components and the place to check them in a real browser.
export default mergeConfig(libraryConfig, defineConfig({
  root: "demo",
  server: { port: 9000 }
}));
