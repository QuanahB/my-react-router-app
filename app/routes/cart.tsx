/**
 * Shopping cart — /cart
 *
 * Loader asks Flask for the current cart. If the API is down, mock line
 * items still render so you can design the page without the backend.
 */

import { Link, useLoaderData } from "react-router";

import { getCart } from "~/lib/api";
import { mockCart } from "~/lib/mock-data";
import type { Cart } from "~/lib/types";
import type { Route } from "./+types/cart";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cart" },
    { name: "description", content: "Your shopping cart" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const cart = await getCart(request.signal);
    return { cart, usingMocks: false as const };
  } catch {
    return { cart: mockCart, usingMocks: true as const };
  }
}

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function lineLabel(item: Cart["items"][number]) {
  return item.product?.name ?? `Product #${item.product_id}`;
}

function lineTotal(item: Cart["items"][number]) {
  if (item.line_total !== undefined) return item.line_total;
  const price = item.product?.price ?? 0;
  return price * item.quantity;
}

export default function CartPage() {
  const { cart, usingMocks } = useLoaderData<typeof loader>();
  const isEmpty = cart.items.length === 0;
  const subtotal =
    cart.subtotal ?? cart.items.reduce((sum, item) => sum + lineTotal(item), 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
        <p className="mt-2 text-stone-600">
          {usingMocks
            ? "Showing a sample cart until Flask is connected."
            : cart.item_count
              ? `${cart.item_count} item${cart.item_count === 1 ? "" : "s"}`
              : null}
        </p>
      </header>

      {isEmpty ? (
        <div className="space-y-4">
          <p className="text-stone-600">Your cart is empty.</p>
          <Link
            to="/shop"
            className="inline-flex bg-stone-900 px-4 py-2 text-sm font-medium tracking-wide text-stone-50 hover:bg-stone-800"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-stone-200 border-y border-stone-200">
            {cart.items.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-medium">{lineLabel(item)}</p>
                  <p className="text-sm text-stone-600">Qty {item.quantity}</p>
                </div>
                <p className="text-sm tracking-wide">
                  {formatMoney(lineTotal(item), item.product?.currency)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-stone-600">Subtotal</p>
            <p className="text-lg font-medium">{formatMoney(subtotal)}</p>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              to="/shop"
              className="inline-flex border border-stone-900 px-4 py-2 text-sm font-medium tracking-wide hover:bg-stone-900 hover:text-stone-50"
            >
              Keep shopping
            </Link>
            <button
                type="button"
                className="inline-flex bg-stone-900 px-4 py-2 text-sm font-medium tracking-wide text-stone-50 hover:bg-stone-800"
              >
                Checkout
              </button>
          </div>
        </>
      )}
    </main>
  );
}
