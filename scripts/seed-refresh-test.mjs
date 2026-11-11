/* GenVeris · Seed refresh tests
   Re-running the demo seed creates only what is missing, and refreshes exactly
   one reference field on seeded risks: the system name. These checks run the
   real seedDemo() against an in-memory stand-in for Prisma and lock that:
   - a fresh database gets the corrected names;
   - an already-seeded database with old names is corrected in place;
   - nothing else on the row is overwritten (a tenant's own edits survive);
   - another tenant's row with the same id is never touched;
   - a second run changes nothing;
   - knowledge assets (generated ids) are not inserted again on a re-run;
   - a clean (non-demo) tenant gets no risks at all.
   Run: npx tsx scripts/seed-refresh-test.mjs */
const { seedDemo } = await import("../lib/seed-core.ts");
const { riskRegister } = await import("../lib/platform-models.ts");

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* Minimal in-memory Prisma: every model supports upsert (create-if-missing,
   apply `update` otherwise), updateMany (equality + NOT) and findMany. */
function fakePrisma(initial = {}) {
  const tables = {};
  const calls = [];
  const rows = m => (tables[m] = tables[m] || []);
  const matches = (row, where) => Object.entries(where).every(([k, v]) =>
    k === "NOT" ? !matches(row, v) : row[k] === v);
  for (const [m, list] of Object.entries(initial)) rows(m).push(...list.map(r => ({ ...r })));
  let seq = 0;
  const model = m => ({
    async upsert({ where, update, create }) {
      calls.push([m, "upsert"]);
      const hit = rows(m).find(r => matches(r, where));
      if (hit) { Object.assign(hit, update); return hit; }
      const row = { id: create.id ?? `${m}-${++seq}`, ...create };
      rows(m).push(row); return row;
    },
    async updateMany({ where, data }) {
      calls.push([m, "updateMany", where, data]);
      const hit = rows(m).filter(r => matches(r, where));
      hit.forEach(r => Object.assign(r, data));
      return { count: hit.length };
    },
    async findMany() { return rows(m); },
    async findFirst({ where }) { return rows(m).find(r => matches(r, where)) || null; },
    async create({ data }) { calls.push([m, "create"]); const row = { id: `${m}-${++seq}`, ...data }; rows(m).push(row); return row; },
  });
  const prisma = new Proxy({}, { get: (_, m) => (typeof m === "string" ? model(m) : undefined) });
  return { prisma, tables, calls };
}

const quiet = async fn => { const log = console.log; console.log = () => {}; try { return await fn(); } finally { console.log = log; } };
const risk = (t, id) => (t.risk || []).find(r => r.id === id);
const expected = Object.fromEntries(riskRegister.map(r => [r.id, r.system]));

{ // fresh database
  const { prisma, tables } = fakePrisma();
  await quiet(() => seedDemo(prisma));
  check("fresh seed creates every register risk", (tables.risk || []).length === riskRegister.length);
  check("fresh seed creates the knowledge assets", (tables.knowledgeAsset || []).length > 0);
  check("fresh seed uses the corrected names", risk(tables, "RSK-011")?.system === "Doc Summarisation AI" && risk(tables, "RSK-012")?.system === "Predictive Maintenance");
}
{ // already-seeded database with the old spellings and a tenant edit
  const { prisma: p0, tables: t0 } = fakePrisma();
  const tenantId = await quiet(() => seedDemo(p0));
  const old = t0.risk.map(r => r.id === "RSK-011" ? { ...r, system: "Document Summarisation AI", title: "Edited by the tenant" }
    : r.id === "RSK-012" ? { ...r, system: "Predictive Maintenance AI", residual: 99 } : r);
  const other = { ...old.find(r => r.id === "RSK-011"), tenantId: "someone-else", system: "Document Summarisation AI" };
  const { prisma, tables, calls } = fakePrisma({ tenant: t0.tenant, risk: [...old, other] });
  await quiet(() => seedDemo(prisma));
  const mine = id => tables.risk.find(r => r.id === id && r.tenantId === tenantId);
  check("re-run corrects RSK-011's system name in place", mine("RSK-011").system === "Doc Summarisation AI");
  check("re-run corrects RSK-012's system name in place", mine("RSK-012").system === "Predictive Maintenance");
  check("re-run keeps the tenant's edited title", mine("RSK-011").title === "Edited by the tenant");
  check("re-run keeps the tenant's edited residual", mine("RSK-012").residual === 99);
  check("another tenant's row with the same id is untouched", tables.risk.find(r => r.tenantId === "someone-else").system === "Document Summarisation AI");
  check("no duplicate rows are created", tables.risk.filter(r => r.tenantId === tenantId).length === riskRegister.length);
  const refresh = calls.filter(([m, op]) => m === "risk" && op === "updateMany");
  check("refresh writes only the system field", refresh.length > 0 && refresh.every(([, , , data]) => Object.keys(data).join() === "system"));
  check("refresh is scoped to this tenant and skips rows already correct", refresh.every(([, , where]) => where.tenantId === tenantId && where.NOT && "system" in where.NOT));
  check("every seeded risk now matches the register", tables.risk.filter(r => r.tenantId === tenantId).every(r => r.system === expected[r.id]));

  // second run is a no-op
  const before = JSON.stringify(tables.risk);
  const { prisma: p2, tables: t2 } = fakePrisma({ tenant: tables.tenant, risk: JSON.parse(before) });
  await quiet(() => seedDemo(p2));
  check("a second run changes nothing", JSON.stringify(t2.risk) === before);
}
{ // knowledge assets are not duplicated on a re-run
  const { prisma: p0, tables: t0 } = fakePrisma();
  await quiet(() => seedDemo(p0));
  const n = t0.knowledgeAsset.length;
  const { prisma, tables } = fakePrisma({ tenant: t0.tenant, knowledgeAsset: t0.knowledgeAsset });
  await quiet(() => seedDemo(prisma));
  await quiet(() => seedDemo(prisma));
  check("re-running the seed twice adds no duplicate knowledge assets", tables.knowledgeAsset.length === n);
}
{ // clean tenant
  const { prisma, tables } = fakePrisma();
  await quiet(() => seedDemo(prisma, { slug: "acme", name: "Acme", mode: "clean" }));
  check("a clean tenant gets no risks", !(tables.risk || []).length);
}

let fail = 0;
for (const [s, n] of R) { if (s === "FAIL") fail++; console.log(`${s}  ${n}`); }
console.log(`\n${R.length - fail}/${R.length} passed`);
if (fail) process.exit(1);
