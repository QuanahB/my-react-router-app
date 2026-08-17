/**
 * Shop catalog — /shop
 *
 * Loader asks Flask for products. If the API is down, mock catalog data
 * still renders so you can build the UI without the backend.
 */

import { Link, useLoaderData } from "react-router";

import { listProducts } from "~/lib/api";
import { mockProducts } from "~/lib/mock-data";
import type { Product } from "~/lib/types";
import type { Route } from "./+types/shop";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shop" },
    { name: "description", content: "Browse the store catalog" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const products = await listProducts(undefined, request.signal);
    return { products, usingMocks: false as const };
  } catch {
    return { products: mockProducts, usingMocks: true as const };
  }
}

function formatPrice(product: Product) {
  const currency = product.currency ?? "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(product.price);
}

export default function Shop() {
  const { products, usingMocks } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
        <p className="mt-2 text-stone-600">
          {usingMocks
            ? "Showing sample products until the Flask catalog is connected."
            : "In stock from the store catalog."}
        </p>
      </header>

      {products.length === 0 ? (
        <p className="text-stone-600">No products yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <article className="flex h-full flex-col gap-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full bg-stone-200" />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <h2 className="text-lg font-medium">{product.name}</h2>
                  {product.description ? (
                    <p className="text-sm text-stone-600">{product.description}</p>
                  ) : null}
                  <p className="mt-auto pt-2 text-sm tracking-wide">
                    {formatPrice(product)}
                  </p>
                </div>
                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center bg-stone-900 px-4 py-2 text-sm font-medium tracking-wide text-stone-50 hover:bg-stone-800"
                >
                  Add to cart
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
