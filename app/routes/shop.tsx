/**
 * Shop catalog — /shop
 *
 * Loader: GET /api/products (falls back to mock-data.ts if Flask is down).
 * Action: POST add-to-cart, then redirect to /cart.
 */

import { Form, Link, data, redirect, useActionData, useLoaderData } from "react-router";

import { ProductImage } from "~/components/ProductImage";
import { addToCart, listProducts } from "~/lib/api";
import { mockProducts } from "~/lib/mock-data";
import { flaskRequestOptions, setCookieHeaders } from "~/lib/session";
import { ApiError, type Product } from "~/lib/types";
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

/**
 * Form posts land here (not in the component).
 * `intent=add-to-cart` plus `product_id` match AddToCartInput on Flask.
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const productId = Number(formData.get("product_id"));
  const setCookies: string[] = [];
  const opts = flaskRequestOptions(request, { captureSetCookie: setCookies });

  try {
    await addToCart({ product_id: productId, quantity: 1 }, opts);
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Could not add to cart";
    return data(
      { error: message },
      { headers: setCookieHeaders(setCookies) },
    );
  }

  // Send Flask's session cookie back to the browser, then open /cart.
  return redirect("/cart", { headers: setCookieHeaders(setCookies) });
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
  const actionData = useActionData<typeof action>();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
        <p className="mt-2 text-stone-600">
          {usingMocks
            ? "Showing sample products until the Flask catalog is connected."
            : "In stock from the store catalog."}
        </p>
        {actionData && "error" in actionData && actionData.error ? (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {actionData.error}
          </p>
        ) : null}
      </header>

      {products.length === 0 ? (
        <p className="text-stone-600">No products yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <article className="flex h-full flex-col gap-3">
                <ProductImage
                  src={product.image_url}
                  videoSrc={product.video_url}
                  alt={product.name}
                  aspect="square"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <h2 className="text-lg font-medium">{product.name}</h2>
                  {product.description ? (
                    <p className="text-sm text-stone-600">{product.description}</p>
                  ) : null}
                  <p className="mt-auto pt-2 text-sm tracking-wide">
                    {formatPrice(product)}
                  </p>
                </div>
                {/* POST to this route's action → Flask POST /api/cart/items */}
                <Form method="post">
                  <input type="hidden" name="intent" value="add-to-cart" />
                  <input type="hidden" name="product_id" value={product.id} />
                  <button
                    type="submit"
                    disabled={usingMocks || product.stock < 1}
                    className="inline-flex w-full items-center justify-center bg-stone-900 px-4 py-2 text-sm font-medium tracking-wide text-stone-50 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {product.stock < 1 ? "Out of stock" : "Add to cart"}
                  </button>
                </Form>
                {usingMocks ? (
                  <p className="text-xs text-stone-500">
                    Start Flask on port 5000 to add real items.{" "}
                    <Link to="/cart" className="underline">
                      View cart
                    </Link>
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
