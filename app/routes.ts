/**
 * Route table for the ecommerce storefront.
 *
 * Each route file can use a `loader` or `action` to call the Flask store
 * API (see app/lib/api.ts) so catalog and cart data from SQL is ready
 * before render.
 */

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("shop", "routes/shop.tsx"),
  route("cart", "routes/cart.tsx"),
] satisfies RouteConfig;
