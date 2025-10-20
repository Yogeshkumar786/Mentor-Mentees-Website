import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   plugins: [
//     react(),
//     mode === 'development' &&
//     componentTagger(),
//   ].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// }));
export default defineConfig({
  server: {
    host: "::",
    port: 3001,
    strictPort: false, // If port 3001 is busy, automatically try 3002, 3003, etc.
  },
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});