/**
 * Storefront configuration for the Flask + SQL ecommerce backend.
 *
 * Architecture:
 *   Shopper browser / React Router loaders
 *        │
 *        ▼
 *   this config + api client  ──HTTP──▶  Flask store API
 *                                             │
 *                                             ▼
 *                                    SQL (products, carts, orders)
 *
 * Payment secrets, DB credentials, and admin keys stay on Flask only.
 * This frontend only needs the public API base URL.
 */

/**
 * Resolve the Flask API base URL for the current runtime.
 *
 * - In the browser: prefer a relative path like "/api" so Vite can proxy
 *   to Flask (see vite.config.ts) and you avoid CORS during local dev.
 * - On the server (SSR loaders/actions): relative URLs would hit the Node
 *   process itself, so we call Flask by absolute URL instead.
 */
function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  // Browser: relative "/api" is ideal (Vite proxy).
  if (typeof window !== "undefined") {
    return fromEnv || "/api";
  }

  // SSR / Node: must be absolute so fetch reaches Flask, not this app.
  // Override with API_URL in production if Flask lives on another host.
  const serverUrl =
    process.env.API_URL?.replace(/\/$/, "") ||
    (fromEnv && /^https?:\/\//.test(fromEnv) ? fromEnv : null) ||
    "http://127.0.0.1:5000/api";

  return serverUrl;
}

/** Base URL used by the storefront API client for every request. */
export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Default request timeout in milliseconds.
 * Keeps catalog/cart pages from hanging if Flask or the database is down.
 */
export const API_TIMEOUT_MS = 10_000;
