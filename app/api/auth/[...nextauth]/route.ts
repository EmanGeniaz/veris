import { NextResponse } from "next/server";
import { handlers, authConfigured } from "@/auth";

const disabled = () => NextResponse.json({ enabled: false }, { status: 404 });
export const GET = (req: Request, ctx: unknown) => authConfigured() ? handlers.GET(req as never) : disabled();
export const POST = (req: Request, ctx: unknown) => authConfigured() ? handlers.POST(req as never) : disabled();
