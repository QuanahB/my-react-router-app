/**
 * Store home — storefront entry and a live check against the Flask API.
 *
 * The loader calls GET /api/health so you can see whether the ecommerce
 * backend (and its SQL database) is reachable before you build catalog pages.
 *
 * If Flask is down, we soft-fail and still render the page so frontend work
 * can continue while the API and product tables are being built.
 */

import { useLoaderData } from "react-router";

import { getHealth } from "~/lib/api";
import { ApiError, type HealthStatus } from "~/lib/types";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { MockButton } from "~/components/MockButton";
import { MockComponent } from "~/components/MockComponent";
import { Logo } from "~/components/Logo";
import { HomepageContainer } from "~/components/HomepageContainer";
import { ProductImage } from "~/components/ProductImage";
import { DescriptionPanel } from "~/components/DescriptionPanel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Store — React Router + Flask" },
    {
      name: "description",
      content: "Ecommerce storefront powered by Flask and SQL",
    },
  ];
}

/**
 * Confirm the store API is up before rendering.
 * Pass `request.signal` so React Router can cancel in-flight calls on navigation.
 */
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const health = await getHealth(request.signal);
    return { health, apiReachable: true as const };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Could not reach the store API";

    const health: HealthStatus = {
      status: "error",
      message,
    };
    return { health, apiReachable: false as const };
  }
}

export default function Home() {
  const { health, apiReachable } = useLoaderData<typeof loader>();

  return (
    <>
      {/* Dev status strip: proves the storefront is wired to Flask. */}
      <div
        className={`px-4 py-2 text-center text-sm ${
          apiReachable && health.status === "ok"
            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
            : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        }`}
        role="status"
      >
        {apiReachable && health.status === "ok" ? (
          <>
            Store API connected
            {health.database ? ` · database: ${health.database}` : null}
            {health.message ? ` · ${health.message}` : null}
          </>
        ) : (
          <>
            Store API not reachable yet
            {health.message ? ` — ${health.message}` : null}. Start Flask on
            port 5000 (see README).
          </>
        )}
      </div>
      <HomepageContainer
        slides={[
          {
            left: <ProductImage alt="Featured product" />,
            right: (
              <DescriptionPanel text="Featured product — hover the large image for a preview clip." />
            ),
          },
          {
            left: <p className="p-4 text-2xl font-semibold">Summer sale</p>,
            right: <p className="p-4">Slide 2 — promo copy</p>,
          },
          {
            left: <p className="p-4 text-2xl font-semibold">New arrivals</p>,
            right: <MockButton>Shop now</MockButton>,
          },
        ]}
      />
      <Welcome />
      <MockButton>Add to cart</MockButton>
      <MockComponent defaultValue="Write a product review..."  alternate="alternate"/>
      <Logo></Logo>
    </>
  );
}
