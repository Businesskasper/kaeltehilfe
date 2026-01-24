import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
        api: "modern-compiler",
        additionalData: (source: string, filepath: string) => {
          if (filepath.endsWith("_mantine.scss")) return source;
          return `@use "${path.resolve("src/_mantine").replace(/\\/g, "/")}" as mantine;${source}`;
        },
      },
    },
  },
  build: {
    outDir: "../build/frontend/publish-frontend",
    emptyOutDir: true,
  },
});
