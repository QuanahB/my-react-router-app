/**
 * HTTP client for the ecommerce Flask API.
 *
 * Storefront UI (this React Router app) never talks to SQL directly.
 * Flask owns products, inventory, carts, and orders in the database.
 *
 * Use these helpers from:
 *   - React Router loaders / actions (preferred for page data)
 *   - Client event handlers (add-to-cart, quantity updates, checkout)
 *
 * Paths are relative to API_BASE_URL (e.g. "products" → "/api/products").
 */

import { API_BASE_URL, API_TIMEOUT_MS } from "./config";
import {
  ApiError,
  type AddToCartInput,
  type ApiMessage,
  type Cart,
  type CheckoutInput,
  type HealthStatus,
  type Order,
  type Product,
  type ProductListParams,
  type UpdateCartItemInput,
} from "./types";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Extra headers merged into the request. */
  headers?: HeadersInit;
  /** Abort after this many ms (defaults to API_TIMEOUT_MS). */
  timeoutMs?: number;
  /** Optional AbortSignal from the caller (e.g. React Router request.signal). */
  signal?: AbortSignal;
};

/**
 * Low-level fetch helper. Prefer the named storefront methods below
 * (listProducts, getCart, checkout, …) from route code.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers,
    timeoutMs = API_TIMEOUT_MS,
    signal: externalSignal,
  } = options;

  // Ensure path joins cleanly whether callers pass "products" or "/products".
  const url = `${API_BASE_URL}/${path.replace(/^\//, "")}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // If the caller already has a signal (loader cancellation), abort together.
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      // Include cookies so Flask can keep a cart/session across requests.
      credentials: "include",
    });

    const text = await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        // Flask (or the proxy) returned non-JSON — keep raw text for debugging.
        data = text;
      }
    }

    if (!response.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : `Request failed with status ${response.status}`;

      throw new ApiError(message, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out or was cancelled", 408);
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      0,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Build a query string from product list filters (skips empty values). */
function toQueryString(params?: ProductListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.search) search.set("search", params.search);
  if (params.in_stock !== undefined) {
    search.set("in_stock", String(params.in_stock));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------------------------------------
// Storefront API — map 1:1 to Flask routes backed by SQL tables.
// ---------------------------------------------------------------------------

/** GET /api/health — confirm Flask (and optionally the store DB) is reachable. */
export function getHealth(signal?: AbortSignal) {
  return apiRequest<HealthStatus>("health", { signal });
}

/** GET /api/products — catalog listing (optional category / search filters). */
export function listProducts(
  params?: ProductListParams,
  signal?: AbortSignal,
) {
  return apiRequest<Product[]>(`products${toQueryString(params)}`, { signal });
}

/** GET /api/products/:id — single product detail + stock. */
export function getProduct(id: number, signal?: AbortSignal) {
  return apiRequest<Product>(`products/${id}`, { signal });
}

/** GET /api/products/slug/:slug — product detail by URL-friendly slug. */
export function getProductBySlug(slug: string, signal?: AbortSignal) {
  return apiRequest<Product>(`products/slug/${encodeURIComponent(slug)}`, {
    signal,
  });
}

/** GET /api/cart — current shopping cart (session or authenticated customer). */
export function getCart(signal?: AbortSignal) {
  return apiRequest<Cart>("cart", { signal });
}

/** POST /api/cart/items — add a product to the cart (Flask updates SQL). */
export function addToCart(input: AddToCartInput, signal?: AbortSignal) {
  return apiRequest<Cart>("cart/items", {
    method: "POST",
    body: input,
    signal,
  });
}

/** PATCH /api/cart/items/:id — change quantity on a cart line. */
export function updateCartItem(
  itemId: number,
  input: UpdateCartItemInput,
  signal?: AbortSignal,
) {
  return apiRequest<Cart>(`cart/items/${itemId}`, {
    method: "PATCH",
    body: input,
    signal,
  });
}

/** DELETE /api/cart/items/:id — remove a line from the cart. */
export function removeCartItem(itemId: number, signal?: AbortSignal) {
  return apiRequest<Cart>(`cart/items/${itemId}`, {
    method: "DELETE",
    signal,
  });
}

/** POST /api/checkout — place an order from the current cart. */
export function checkout(input: CheckoutInput, signal?: AbortSignal) {
  return apiRequest<Order>("checkout", {
    method: "POST",
    body: input,
    signal,
  });
}

/** GET /api/orders/:id — look up a placed order (confirmation / tracking). */
export function getOrder(id: number, signal?: AbortSignal) {
  return apiRequest<Order>(`orders/${id}`, { signal });
}

/** DELETE /api/cart — empty the cart (e.g. after a successful checkout). */
export function clearCart(signal?: AbortSignal) {
  return apiRequest<ApiMessage>("cart", {
    method: "DELETE",
    signal,
  });
}
