import { NextResponse } from "next/server";
import { authConfigured, ssoProviders } from "@/auth";

export function GET() {
  return NextResponse.json({ enabled: authConfigured(), sso: ssoProviders() });
}
