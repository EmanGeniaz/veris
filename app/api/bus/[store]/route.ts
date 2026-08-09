/* Persistence bus: evidence, decisions and ideas flow here when the
   database is configured; the client falls back to localStorage when
   it is not. One demo tenant for now - auth and multi-tenant arrive in
   Phase 2b. */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, authConfigured } from "@/auth";
import { auditAppend } from "@/lib/audit";
import { can, isCap, STORE_REQUIREMENT, STORE_READ_REQUIREMENT, type AccessMatrix } from "@/lib/rbac";

const STORES = new Set(["evidence", "decisions", "ideas", "taxonomyAdds", "taxonomyRequests", "adminAudit", "rbacPolicy", "policies", "violations"]);

/* Per-tenant RBAC overrides → nested matrix laid over lib/rbac defaults. */
async function loadOverrides(prisma: NonNullable<ReturnType<typeof db>>, tenantId: string): Promise<AccessMatrix> {
  try {
    const rows = await prisma.rbacGrant.findMany({ where: { tenantId } });
    const m: AccessMatrix = {};
    for (const r of rows) { if (isCap(r.capability)) { (m[r.role] ??= {})[r.module] = r.capability; } }
    return m;
  } catch { return {}; }
}

async function sessionRole(): Promise<string | null> {
  if (!authConfigured()) return null;
  const session = await auth();
  return (session?.user as { role?: string } | undefined)?.role ?? null;
}

async function sessionCtx(prisma: NonNullable<ReturnType<typeof db>>, reqHost?: string | null) {
  let identity: { name: string; email: string } | null = null;
  let tenantId: string | null = null;
  if (authConfigured()) {
    const session = await auth();
    if (session?.user?.email) {
      identity = { name: session.user.name || session.user.email, email: session.user.email };
      const u = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (u) tenantId = u.tenantId;
    }
  }
  if (!tenantId) {
    /* Anonymous callers are confined to the public demo tenant whenever auth is
       configured: a real tenant's data is only ever served to a signed-in user
       (resolved above from their session). Without this guard, an unauthenticated
       request to acme.veriszone.com/api/bus/* would return acme's real data —
       including adminAudit / rbacPolicy — purely from the Host header.
       Host-based tenant routing therefore applies only in the no-auth mode used
       for local/self-hosted demo deployments. */
    const host = (reqHost || "").split(":")[0];
    const label = host.split(".")[0];
    let slug = "demo";
    if (!authConfigured() && label && !["console", "www", "localhost", "veriszone", "veris"].includes(label)) {
      if (await prisma.tenant.findUnique({ where: { slug: label } })) slug = label;
    }
    const t = await prisma.tenant.upsert({
      where: { slug },
      update: {},
      create: { slug: "demo", name: "VerisZone Demo Center", mode: "demo" },
    });
    tenantId = t.id;
  }
  return { tenantId, identity };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ store: string }> }) {
  const { store } = await ctx.params;
  if (!STORES.has(store)) return NextResponse.json({ enabled: false }, { status: 404 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false });
  try {
    const { tenantId: tid, identity } = await sessionCtx(prisma, _req.headers.get("x-forwarded-host") || _req.headers.get("host"));
    /* Per-role read gate for admin-scoped stores. Only enforced for an
       authenticated caller (identity present ⇒ auth configured + signed in);
       the public demo tenant carries no identity and stays open for showcase. */
    const readNeed = STORE_READ_REQUIREMENT[store];
    if (readNeed && identity && !can(await sessionRole(), readNeed.module, readNeed.minCap, await loadOverrides(prisma, tid))) {
      return NextResponse.json({ enabled: true, ok: false, error: `reading ${store} requires '${readNeed.minCap}' on ${readNeed.module}` }, { status: 403 });
    }
    const rows =
      store === "rbacPolicy" ? (await prisma.rbacGrant.findMany({ where: { tenantId: tid } })).map(r => ({ role: r.role, module: r.module, capability: r.capability }))
      : store === "adminAudit" ? (await prisma.auditLog.findMany({ where: { tenantId: tid, entity: "admin" }, orderBy: { createdAt: "desc" }, take: 40 })).map(r => ({ at: new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), actor: r.actor, action: r.action, target: r.detail }))
      : store === "evidence" ? await prisma.evidence.findMany({ where: { tenantId: tid }, orderBy: { createdAt: "desc" }, take: 100 })
      : store === "decisions" ? await prisma.decision.findMany({ where: { tenantId: tid }, orderBy: { createdAt: "desc" }, take: 100 })
      : store === "taxonomyAdds" ? await prisma.taxonomyAdd.findMany({ where: { tenantId: tid }, orderBy: { createdAt: "desc" }, take: 100 })
      : store === "taxonomyRequests" ? await prisma.taxonomyRequest.findMany({ where: { tenantId: tid }, orderBy: { createdAt: "desc" }, take: 100 })
      : store === "policies" ? (await prisma.policy.findMany({ where: { tenantId: tid }, include: { rules: true } })).map(p => ({ id: p.id, key: p.key, name: p.name, category: p.category, status: p.status, owner: p.ownerRole, version: p.currentVersion, reviewCycleDays: p.reviewCycleDays, rules: p.rules.map(r => ({ id: r.id, name: r.name, clauseRef: r.clauseRef, action: r.action })) }))
      : store === "violations" ? (await prisma.violation.findMany({ where: { tenantId: tid }, orderBy: { occurredAt: "desc" }, take: 200 })).map(v => ({ ruleId: v.ruleId, policyKey: v.policyId, action: v.action, severity: v.severity, model: v.model, classification: v.classification, time: new Date(v.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }))
      : await prisma.idea.findMany({ where: { tenantId: tid }, orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ enabled: true, rows });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ store: string }> }) {
  const { store } = await ctx.params;
  if (!STORES.has(store)) return NextResponse.json({ enabled: false }, { status: 404 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false });
  try {
    const { tenantId: tid, identity } = await sessionCtx(prisma, req.headers.get("x-forwarded-host") || req.headers.get("host"));
    /* Central RBAC gate: governed write stores require a minimum capability
       on their module, evaluated against the tenant's effective matrix. Only
       enforced when auth is configured; the demo tenant is open. */
    const role = await sessionRole();
    const overrides = authConfigured() ? await loadOverrides(prisma, tid) : {};
    const need = STORE_REQUIREMENT[store];
    if (need && authConfigured() && !can(role, need.module, need.minCap, overrides)) {
      return NextResponse.json({ enabled: true, ok: false, error: `writing ${store} requires '${need.minCap}' on ${need.module}` }, { status: 403 });
    }
    if (store === "adminAudit") {
      const rec = await req.json();
      await auditAppend(prisma, tid, String(rec.action ?? "admin action"), "admin", String(rec.target ?? "").slice(0, 300), identity?.email ?? String(rec.actor ?? "demo-anonymous")).catch(() => {});
      return NextResponse.json({ enabled: true, ok: true });
    }
    if (store === "rbacPolicy") {
      const g = await req.json();
      if (!g.role || !g.module || !isCap(g.capability)) {
        return NextResponse.json({ enabled: true, ok: false, error: "invalid grant" }, { status: 400 });
      }
      await prisma.rbacGrant.upsert({
        where: { tenantId_role_module: { tenantId: tid, role: String(g.role), module: String(g.module) } },
        update: { capability: String(g.capability), updatedBy: identity?.email ?? "demo-anonymous" },
        create: { tenantId: tid, role: String(g.role), module: String(g.module), capability: String(g.capability), updatedBy: identity?.email ?? "demo-anonymous" },
      });
      await auditAppend(prisma, tid, "rbac-grant", "admin", `${g.role} · ${g.module} → ${g.capability}`, identity?.email ?? "demo-anonymous").catch(() => {});
      return NextResponse.json({ enabled: true, ok: true });
    }
    const b = await req.json();
    if (identity) {
      if (store === "taxonomyAdds") { b.addedBy = identity.name; }
      else if (store === "taxonomyRequests") { b.requestedBy = identity.name; }
      else { b.owner = identity.name; b.decidedBy = identity.name; b.submitter = identity.name; }
    }
    if (store === "evidence") {
      await prisma.evidence.create({ data: {
        tenantId: tid, item: String(b.item ?? ""), initiative: String(b.initiative ?? ""),
        scope: String(b.scope ?? ""), control: String(b.control ?? ""), risk: String(b.risk ?? ""),
        owner: String(b.owner ?? ""), status: String(b.status ?? ""), approval: String(b.approval ?? ""),
        version: String(b.version ?? "v1"),
      }});
    } else if (store === "decisions") {
      await prisma.decision.create({ data: {
        tenantId: tid, initiativeId: String(b.initiativeId ?? ""), decision: String(b.decision ?? ""),
        rationale: String(b.rationale ?? ""), decidedBy: String(b.decidedBy ?? ""),
      }});
    } else if (store === "taxonomyAdds") {
      await prisma.taxonomyAdd.create({ data: {
        tenantId: tid, vocab: String(b.vocab ?? ""), value: String(b.value ?? ""),
        noun: String(b.noun ?? ""), addedBy: String(b.addedBy ?? identity?.name ?? ""), status: String(b.status ?? "Approved"),
      }});
    } else if (store === "taxonomyRequests") {
      await prisma.taxonomyRequest.create({ data: {
        tenantId: tid, vocab: String(b.vocab ?? ""), value: String(b.value ?? ""), noun: String(b.noun ?? ""),
        owner: String(b.owner ?? ""), requestedBy: String(b.requestedBy ?? identity?.name ?? ""), status: String(b.status ?? "Pending"),
      }});
    } else if (store === "policies") {
      await prisma.policy.upsert({
        where: { tenantId_key: { tenantId: tid, key: String(b.key ?? b.name ?? "POL-NEW") } },
        update: { name: String(b.name ?? ""), category: String(b.category ?? ""), status: String(b.status ?? "Draft"), ownerRole: String(b.owner ?? "Unassigned") },
        create: { tenantId: tid, key: String(b.key ?? b.name ?? "POL-NEW"), name: String(b.name ?? ""), category: String(b.category ?? "Responsible AI"), status: String(b.status ?? "Draft"), ownerRole: String(b.owner ?? "Unassigned"), reviewCycleDays: Number(b.reviewCycleDays ?? 365) },
      });
    } else if (store === "violations") {
      /* Enforcement telemetry: only recordable against a rule that exists in
         the runtime rule table; unknown rules stay in the client bus only. */
      const rule = b.ruleId ? await prisma.runtimeRule.findUnique({ where: { id: String(b.ruleId) } }) : null;
      if (rule) {
        await prisma.violation.create({ data: {
          tenantId: tid, ruleId: rule.id, policyId: rule.policyId, action: String(b.action ?? "Flagged"),
          severity: Number(b.severity ?? rule.severity ?? 2), model: b.model ? String(b.model) : null,
          classification: b.classification ? String(b.classification) : null,
        }});
      } else {
        return NextResponse.json({ enabled: true, ok: true, recorded: "client-only" });
      }
    } else {
      await prisma.idea.create({ data: {
        tenantId: tid, title: String(b.title ?? ""), problem: String(b.problem ?? ""),
        unit: String(b.unit ?? ""), submitter: String(b.submitter ?? ""), stage: String(b.stage ?? "Submitted"),
      }});
    }
    await auditAppend(prisma, tid, "create", store, String(b.item ?? b.title ?? b.decision ?? "").slice(0, 300), identity?.email ?? "demo-anonymous").catch(() => {});
    return NextResponse.json({ enabled: true, ok: true });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
