/**
 * Shopping cart — /cart
 *
 * Loader: GET /api/cart. After Stripe, also GET /api/checkout/confirm.
 * Actions: update qty, remove a line, or start Stripe Checkout.
 */

import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";

import {
  checkout,
  confirmCheckout,
  getCart,
  getOrder,
  removeCartItem,
  updateCartItem,
} from "~/lib/api";
import { mockCart } from "~/lib/mock-data";
import { flaskRequestOptions, setCookieHeaders } from "~/lib/session";
import { ApiError, type Cart, type Order } from "~/lib/types";
import type { Route } from "./+types/cart";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cart" },
    { name: "description", content: "Your shopping cart" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const checkoutState = url.searchParams.get("checkout");
  const sessionId = url.searchParams.get("session_id");
  const orderId = url.searchParams.get("order_id");

  const setCookies: string[] = [];
  const opts = flaskRequestOptions(request, { captureSetCookie: setCookies });

  // Stripe redirects here with session_id. Flask asks Stripe if it was paid.
  let paidOrder: Order | null = null;
  if (checkoutState === "success" && sessionId) {
    try {
      paidOrder = await confirmCheckout(sessionId, opts);
    } catch {
      if (orderId) {
        try {
          paidOrder = await getOrder(Number(orderId), opts);
        } catch {
          paidOrder = null;
        }
      }
    }
  }

  try {
    const cart = await getCart(opts);
    return data(
      {
        cart,
        usingMocks: false as const,
        checkoutState,
        paidOrder,
      },
      { headers: setCookieHeaders(setCookies) },
    );
  } catch {
    return {
      cart: mockCart,
      usingMocks: true as const,
      checkoutState,
      paidOrder,
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const setCookies: string[] = [];
  const opts = flaskRequestOptions(request, { captureSetCookie: setCookies });
  const headers = () => setCookieHeaders(setCookies);

  try {
    if (intent === "update") {
      const itemId = Number(formData.get("item_id"));
      const quantity = Number(formData.get("quantity"));
      await updateCartItem(itemId, { quantity }, opts);
      return data({ ok: true as const }, { headers: headers() });
    }

    if (intent === "remove") {
      const itemId = Number(formData.get("item_id"));
      await removeCartItem(itemId, opts);
      return data({ ok: true as const }, { headers: headers() });
    }

    if (intent === "checkout") {
      const result = await checkout(
        {
          email: String(formData.get("email") ?? ""),
          shipping_name: String(formData.get("shipping_name") ?? ""),
          shipping_address: String(formData.get("shipping_address") ?? ""),
          shipping_city: String(formData.get("shipping_city") ?? ""),
          shipping_postal_code: String(formData.get("shipping_postal_code") ?? ""),
          shipping_country: String(formData.get("shipping_country") || "US"),
        },
        opts,
      );
      if (!result.checkout_url) {
        return data(
          { error: "Stripe did not return a checkout URL" },
          { headers: headers() },
        );
      }
      // Leave this site for Stripe-hosted Checkout (test card 4242…).
      return redirect(result.checkout_url, { headers: headers() });
    }

    return data(
      { error: "Unknown cart action" },
      { status: 400, headers: headers() },
    );
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Cart request failed";
    return data({ error: message }, { headers: headers() });
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
  const { cart, usingMocks, checkoutState, paidOrder } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const error =
    actionData && "error" in actionData ? actionData.error : undefined;

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
        {checkoutState === "cancel" ? (
          <p className="mt-2 text-sm text-amber-800" role="status">
            Payment was cancelled. Your cart is unchanged.
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </header>

      {paidOrder ? (
        <section className="space-y-4 border border-stone-200 p-6">
          <h2 className="text-xl font-medium">
            {paidOrder.status === "paid" ? "Payment received" : "Order pending"}
          </h2>
          <p className="text-stone-600">
            Order #{paidOrder.id} · {paidOrder.status} ·{" "}
            {formatMoney(paidOrder.total, paidOrder.currency)}
          </p>
          <Link
            to="/shop"
            className="inline-flex bg-stone-900 px-4 py-2 text-sm font-medium tracking-wide text-stone-50 hover:bg-stone-800"
          >
            Continue shopping
          </Link>
        </section>
      ) : isEmpty ? (
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
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-medium">{lineLabel(item)}</p>
                  <Form method="post" className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="intent" value="update" />
                    <input type="hidden" name="item_id" value={item.id} />
                    <label className="text-sm text-stone-600">
                      Qty{" "}
                      <input
                        type="number"
                        name="quantity"
                        min={1}
                        defaultValue={item.quantity}
                        className="ml-1 w-16 border border-stone-300 px-2 py-1"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={usingMocks}
                      className="text-sm underline disabled:no-underline disabled:opacity-50"
                    >
                      Update
                    </button>
                  </Form>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm tracking-wide">
                    {formatMoney(lineTotal(item), item.product?.currency)}
                  </p>
                  <Form method="post">
                    <input type="hidden" name="intent" value="remove" />
                    <input type="hidden" name="item_id" value={item.id} />
                    <button
                      type="submit"
                      disabled={usingMocks}
                      className="text-sm text-stone-600 underline disabled:no-underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </Form>
                </div>
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
          </div>

          <Form method="post" className="mt-10 space-y-4 border-t border-stone-200 pt-8">
            <input type="hidden" name="intent" value="checkout" />
            <h2 className="text-xl font-medium">Checkout</h2>
            <p className="text-sm text-stone-600">
              You will be sent to Stripe to pay (test card 4242 4242 4242 4242).
            </p>
            <label className="block text-sm">
              Email
              <input
                required
                type="email"
                name="email"
                className="mt-1 w-full border border-stone-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Name
              <input
                required
                type="text"
                name="shipping_name"
                className="mt-1 w-full border border-stone-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Address
              <input
                required
                type="text"
                name="shipping_address"
                className="mt-1 w-full border border-stone-300 px-3 py-2"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                City
                <input
                  required
                  type="text"
                  name="shipping_city"
                  className="mt-1 w-full border border-stone-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                Postal code
                <input
                  required
                  type="text"
                  name="shipping_postal_code"
                  className="mt-1 w-full border border-stone-300 px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              Country
              <input
                type="text"
                name="shipping_country"
                defaultValue="US"
                className="mt-1 w-full border border-stone-300 px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={usingMocks}
              className="inline-flex bg-stone-900 px-4 py-2 text-sm font-medium tracking-wide text-stone-50 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Pay with Stripe
            </button>
          </Form>
        </>
      )}
    </main>
  );
}
