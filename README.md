# Ecommerce storefront (React Router + Flask + SQL)

This React Router app is the **storefront frontend** for an ecommerce site.
Flask serves the JSON API; SQL holds products, inventory, carts, and orders.

```
Shopper  →  React Router (this app)  →  Flask store API  →  SQL DB
```

## What's already wired

- `app/lib/config.ts` — API base URL (`VITE_API_BASE_URL` / `API_URL`)
- `app/lib/types.ts` — Product, Cart, Order, Checkout types
- `app/lib/api.ts` — store helpers (`listProducts`, `addToCart`, `checkout`, …)
- `vite.config.ts` — proxies `/api` → `http://127.0.0.1:5000` in development
- `app/routes/home.tsx` — loader calls `GET /api/health` and shows status

## Getting started

### 1. Frontend

```bash
cp .env.example .env
npm install
npm run dev
```

Storefront: [http://localhost:5173](http://localhost:5173)

### 2. Flask store API (expected contract)

Run Flask on port **5000** with routes under `/api`. Minimum health check:

```python
@app.get("/api/health")
def health():
    # Optionally verify SQL connectivity here
    return {"status": "ok", "database": "connected"}
```

Store endpoints already typed on the frontend:

| Method | Path | Frontend helper |
|--------|------|-----------------|
| GET | `/api/health` | `getHealth()` |
| GET | `/api/products` | `listProducts({ search, category })` |
| GET | `/api/products/:id` | `getProduct(id)` |
| GET | `/api/products/slug/:slug` | `getProductBySlug(slug)` |
| GET | `/api/cart` | `getCart()` |
| POST | `/api/cart/items` | `addToCart({ product_id, quantity })` |
| PATCH | `/api/cart/items/:id` | `updateCartItem(id, { quantity })` |
| DELETE | `/api/cart/items/:id` | `removeCartItem(id)` |
| DELETE | `/api/cart` | `clearCart()` |
| POST | `/api/checkout` | `checkout({ email, shipping_… })` |
| GET | `/api/orders/:id` | `getOrder(id)` |

Enable CORS on Flask only if the browser calls it without the Vite proxy (e.g. production on a different origin).

### 3. Loading the catalog in a route

```tsx
import { listProducts } from "~/lib/api";

export async function loader({ request }: Route.LoaderArgs) {
  const products = await listProducts({ in_stock: true }, request.signal);
  return { products };
}
```

Use React Router `action` functions for add-to-cart and checkout mutations.

### Suggested next routes

Register these in `app/routes.ts` as you build pages:

- `products` / `products/:slug` — catalog & product detail
- `cart` — shopping cart
- `checkout` — shipping form → `checkout()`
- `orders/:id` — order confirmation

## Production

Set `VITE_API_BASE_URL` (browser) and `API_URL` (SSR loaders) to your deployed Flask origin before `npm run build`. Keep database credentials and payment secrets on the Flask server only.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR + Flask proxy |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Generate route types + TypeScript check |

## Docs

- [React Router](https://reactrouter.com/)
- [Flask](https://flask.palletsprojects.com/)
