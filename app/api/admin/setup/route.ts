/* One-time database activation. With the Postgres store connected and
   VZ_SETUP_TOKEN set, visiting this route creates the tables and seeds
   the demo tenant - no local CLI needed. Idempotent; token-guarded. */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedDemo } from "@/lib/seed-core";
import { INIT_SQL } from "@/prisma/init-sql";
import { limit, safeEqual, serverError } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  // Token-guarded admin route: auth-tier rate limit so the token can't be brute-forced.
  const limited = await limit(req, "auth", "admin-setup");
  if (limited) return limited;
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const expected = process.env.VZ_SETUP_TOKEN;
  if (!expected || !safeEqual(token, expected)) return NextResponse.json({ ok: false, error: "setup token missing or wrong" }, { status: 403 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured - connect the Postgres store first" }, { status: 400 });
  const results: string[] = [];
  for (const stmt of INIT_SQL.split(";")) {
    const sql = stmt.trim();
    if (!sql) continue;
    try { await prisma.$executeRawUnsafe(sql); results.push("ok"); }
    catch (e) { results.push(/already exists/i.test(String(e)) ? "exists" : "skip"); }
  }
  try {
    const tenantId = await seedDemo(prisma);
    return NextResponse.json({ ok: true, ddl: results.length, seededTenant: tenantId });
  } catch (e) {
    // Full error goes to the server log under the returned requestId, never to the client.
    return serverError(e, "admin.setup.seed");
  }
}
