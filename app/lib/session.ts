/**
 * Session-cookie helpers for talking to Flask from React Router.
 *
 * Why this file exists:
 *   Browser fetches to `/api` go through the Vite proxy, so Flask's Set-Cookie
 *   is stored for localhost:5173 automatically.
 *
 *   Loaders and actions run on the Node server (SSR). `fetch` there talks to
 *   Flask at 127.0.0.1:5000 and does NOT send the shopper's cookies unless we
 *   copy them off the incoming Request. After Flask replies, we copy any
 *   Set-Cookie headers onto the React Router response so the browser keeps
 *   the same cart session.
 */

import type { RequestOptions } from "./api";

/**
 * Copy the browser Cookie header onto the Flask request.
 * Pass the returned object into getCart / addToCart / checkout / etc.
 */
export function flaskRequestOptions(
  request: Request,
  extra: RequestOptions = {},
): RequestOptions {
  const cookie = request.headers.get("Cookie");
  return {
    signal: request.signal,
    ...extra,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...extra.headers,
    },
  };
}

/** Turn Flask Set-Cookie values into headers React Router can send back. */
export function setCookieHeaders(setCookies: string[]): Headers | undefined {
  if (setCookies.length === 0) return undefined;
  const headers = new Headers();
  for (const cookie of setCookies) {
    headers.append("Set-Cookie", cookie);
  }
  return headers;
}
