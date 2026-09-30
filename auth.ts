/* Auth activates when AUTH_SECRET and a database are configured; the
   demo entry flow is untouched otherwise. Credentials verify against
   the User table; SSO providers switch on via their env vars. */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Google from "next-auth/providers/google";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db, dbConfigured } from "@/lib/db";
import { backoffWaitMs, clearAuthFailures, rateLimitDisabled, recordAuthFailure } from "@/lib/rate-limit";

export const authConfigured = (): boolean => !!process.env.AUTH_SECRET && dbConfigured();

export const ssoProviders = (): string[] => [
  ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ID ? ["microsoft-entra-id"] : []),
  ...(process.env.AUTH_GOOGLE_ID ? ["google"] : []),
];

export function hashPassword(pw: string, salt: string): string {
  return salt + ":" + scryptSync(pw, salt, 32).toString("hex");
}
function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const a = scryptSync(pw, salt, 32);
  const b = Buffer.from(hex, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  /* No AUTH_SECRET ⇒ auth is disabled (every route checks authConfigured()).
     The fallback is a random per-process value rather than a constant in
     source, so even if some path signed a token in that mode it could not be
     forged (security baseline · control 3). */
  secret: process.env.AUTH_SECRET || randomBytes(32).toString("hex"),
  /* Trust the deployment host. Auth.js only auto-trusts on Vercel (via the
     VERCEL env var); on a custom domain or any self-managed host it otherwise
     throws UntrustedHost and every sign-in 500s. AUTH_TRUST_HOST still overrides
     if it is ever set. */
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const prisma = db();
        if (!prisma || typeof creds?.email !== "string" || typeof creds?.password !== "string") return null;
        const email = creds.email.trim().toLowerCase();
        if (!email || email.length > 254 || creds.password.length > 256) return null;
        /* Per-account exponential backoff (security baseline · control 1). The
           route gate answers 429 first; this is the backstop for any other
           path into authorize. While backing off, the password isn't checked. */
        const acct = `signin:${email}`;
        if (!rateLimitDisabled() && (await backoffWaitMs(acct)) > 0) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || !verifyPassword(creds.password, user.passwordHash)) {
          await recordAuthFailure(acct);
          return null;
        }
        await clearAuthFailures(acct);
        return { id: user.id, email: user.email, name: user.name, role: user.role } as never;
      },
    }),
    ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ID ? [MicrosoftEntraID] : []),
    ...(process.env.AUTH_GOOGLE_ID ? [Google] : []),
  ],
  callbacks: {
    jwt: ({ token, user }) => { if (user && "role" in user) token.role = (user as { role?: string }).role; return token; },
    session: ({ session, token }) => { (session.user as { role?: string }).role = token.role as string | undefined; return session; },
  },
});
