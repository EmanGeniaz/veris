/* Auth activates when AUTH_SECRET and a database are configured; the
   demo entry flow is untouched otherwise. Credentials verify against
   the User table; SSO providers switch on via their env vars. */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Google from "next-auth/providers/google";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { db, dbConfigured } from "@/lib/db";

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
  secret: process.env.AUTH_SECRET || "auth-disabled-placeholder",
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const prisma = db();
        if (!prisma || !creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: String(creds.email) } });
        if (!user?.passwordHash || !verifyPassword(String(creds.password), user.passwordHash)) return null;
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
