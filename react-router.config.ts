/**
 * React Router framework config for the storefront.
 *
 * SSR stays enabled so loaders can fetch catalog/cart data from Flask
 * before HTML is sent. Set `ssr: false` if you want a pure SPA that only
 * talks to Flask from the browser.
 */

import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render by default; set to `false` for SPA-only mode.
  ssr: true,
  future: {
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
