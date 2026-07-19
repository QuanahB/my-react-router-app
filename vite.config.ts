/**
 * Vite configuration for the ecommerce storefront.
 *
 * The `server.proxy` block forwards `/api/*` to Flask during local
 * development so the browser can load products/cart without CORS setup.
 */

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
    proxy: {
      // Store API: GET /api/products  →  http://127.0.0.1:5000/api/products
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        // Uncomment if Flask mounts routes at "/" instead of "/api":
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
