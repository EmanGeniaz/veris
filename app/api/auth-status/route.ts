import { NextResponse } from "next/server";
import { authConfigured, ssoProviders } from "@/auth";
import { authReadiness } from "@/lib/auth-readiness";
import { dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";

export function GET() {
  /* readiness reports which provisioning prerequisites are set as booleans only
     (never secret values), so an operator can confirm AUTH_SECRET / DATABASE_URL
     / DIRECT_URL are in place from the deployed app.

     `telemetry` is the authoritative live-vs-demo signal (BL-03): when no real
     database is configured, the app's governance / cost / framework numbers are
     seeded demonstration data, and every surface badges them honestly so no one
     mistakes a demo figure for live governance telemetry. */
  return NextResponse.json({
    enabled: authConfigured(),
    sso: ssoProviders(),
    readiness: authReadiness(),
    telemetry: telemetryMode(dbConfigured()),
  });
}
