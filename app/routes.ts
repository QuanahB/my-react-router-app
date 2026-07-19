/**
 * Route table for the ecommerce storefront.
 *
 * Add shop pages here as you grow the UI. Each route can use a `loader`
 * or `action` to call the Flask store API (see app/lib/api.ts) so
 * catalog, cart, and order data from SQL is ready before render.
 *
 * Examples to add later:
 *   route("products", "routes/products.tsx")
 *   route("products/:slug", "routes/product-detail.tsx")
 *   route("cart", "routes/cart.tsx")
 *   route("checkout", "routes/checkout.tsx")
 *   route("orders/:id", "routes/order-confirmation.tsx")
 */

import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  // "/" — store home; demonstrates a Flask health-check loader
  index("routes/home.tsx"),
] satisfies RouteConfig;
