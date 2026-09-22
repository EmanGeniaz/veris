import { NextResponse } from "next/server";
import { authConfigured, ssoProviders } from "@/auth";
import { authReadiness } from "@/lib/auth-readiness";

export function GET() {
  /* readiness reports which provisioning prerequisites are set as booleans only
     (never secret values), so an operator can confirm AUTH_SECRET / DATABASE_URL
     / DIRECT_URL are in place from the deployed app. */
  return NextResponse.json({ enabled: authConfigured(), sso: ssoProviders(), readiness: authReadiness() });
}
