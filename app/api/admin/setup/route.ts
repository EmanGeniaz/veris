/* One-time database activation. With the Postgres store connected and
   VZ_SETUP_TOKEN set, visiting this route creates the tables and seeds
   the demo tenant - no local CLI needed. Idempotent; token-guarded. */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedDemo } from "@/lib/seed-core";
import { INIT_SQL } from "@/prisma/init-sql";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const expected = process.env.VZ_SETUP_TOKEN;
  if (!expected || token !== expected) return NextResponse.json({ ok: false, error: "setup token missing or wrong" }, { status: 403 });
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
    return NextResponse.json({ ok: false, error: "DDL ran but seeding failed: " + String(e).slice(0, 200) }, { status: 500 });
  }
}
