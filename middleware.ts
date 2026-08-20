import { NextResponse, type NextRequest } from "next/server";

/* Server-side route protection for real user workspaces.
 *
 * Model: the seeded *public showcases* — the Demo Center (/workspace/demo/*)
 * and the standalone AI Central (/workspace/aicentral/*) — carry no real tenant
 * data and stay open (that is the whole point of the demo). A *registered
 * user's* workspace lives at /workspace/<role>/* and holds real data, so an
 * unauthenticated visitor is bounced to the entry page to sign in.
 *
 * This is a UX redirect gate, not the security boundary. The actual boundary is
 * server-side: every data route runs Auth.js `auth()` + per-tenant RBAC in the
 * Node runtime, so a forged cookie gets a signed-in *shell* but no real data.
 * Keeping the middleware a cookie-*presence* check (rather than a cryptographic
 * decode) is deliberate:
 *   - it is edge-safe — no Prisma, no Node crypto pulled into the edge bundle;
 *   - it can never lock out a genuinely signed-in user. `getToken()` derives its
 *     cookie name from `secureCookie` (default false → `authjs.session-token`),
 *     but on an https deploy the real cookie is `__Secure-authjs.session-token`;
 *     a mismatch there would decode to null and redirect a signed-in user in a
 *     loop. A presence check over both cookie names has no such failure mode.
 *
 * It only activates when real auth is configured (AUTH_SECRET present). On a
 * demo-only deployment it is a no-op, so nothing about the current experience
 * changes. */
export function middleware(req: NextRequest) {
  if (!process.env.AUTH_SECRET) return NextResponse.next(); // demo-only: nothing to enforce

  const parts = req.nextUrl.pathname.split("/").filter(Boolean); // ["workspace", <seg>, ...]
  const seg = parts[1];

  // Public seeded showcases — no real data behind them.
  if (!seg || seg === "demo" || seg === "aicentral") return NextResponse.next();

  // A real user's role workspace: require an Auth.js session cookie. Check both
  // the secure-prefixed name (https deploys) and the bare name (http/dev).
  const c = req.cookies;
  const hasSession =
    c.has("__Secure-authjs.session-token") ||
    c.has("authjs.session-token") ||
    // chunked cookies for large sessions
    c.has("__Secure-authjs.session-token.0") ||
    c.has("authjs.session-token.0");
  if (hasSession) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("signin", "1");
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/workspace/:path*"] };
