/**
 * Shared TypeScript types for the ecommerce storefront.
 *
 * These mirror JSON shapes returned by Flask, which reads/writes the SQL
 * database (products, carts, orders, customers, etc.).
 * Keep them in sync with your Flask serializers / response schemas.
 */

/** Generic envelope many Flask APIs use for success/error responses. */
export type ApiMessage = {
  message: string;
};

/**
 * Health-check payload from Flask.
 * Wire GET /api/health to confirm the API and SQL database are up.
 */
export type HealthStatus = {
  status: "ok" | "error";
  /** Optional: confirms Flask could reach the store's SQL database. */
  database?: "connected" | "disconnected";
  message?: string;
};

/** Product category stored in SQL and exposed by Flask. */
export type Category = {
  id: number;
  name: string;
  slug: string;
};

/**
 * Catalog product — the core storefront entity.
 * Prices are in the smallest currency unit (e.g. cents) or decimal strings;
 * match whatever format your Flask/SQL layer uses (here: number = major units).
 */
export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  /** Unit price in major currency units (e.g. 19.99). */
  price: number;
  currency?: string;
  image_url?: string;
  /** Remaining sellable quantity from inventory in SQL. */
  stock: number;
  category_id?: number;
  category?: Category;
  created_at?: string;
};

/** Query params for browsing / filtering the catalog. */
export type ProductListParams = {
  category?: string;
  search?: string;
  /** Only return products with stock > 0. */
  in_stock?: boolean;
};

/** One line in the shopping cart. */
export type CartItem = {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  /** Line total (price × quantity), if Flask computes it. */
  line_total?: number;
};

/** Session or customer cart returned by Flask. */
export type Cart = {
  id: number;
  items: CartItem[];
  /** Sum of line totals. */
  subtotal?: number;
  item_count?: number;
};

/** Body for adding a product to the cart. */
export type AddToCartInput = {
  product_id: number;
  quantity?: number;
};

/** Body for updating a cart line quantity. */
export type UpdateCartItemInput = {
  quantity: number;
};

/** Order status values your Flask/SQL layer can return. */
export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

/** A placed order (checkout result). */
export type Order = {
  id: number;
  status: OrderStatus;
  total: number;
  currency?: string;
  created_at?: string;
  items?: CartItem[];
};

/** Checkout payload sent to Flask to create an order from the cart. */
export type CheckoutInput = {
  email: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country?: string;
};

/** Structured error thrown by the API client when Flask returns a non-OK status. */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
