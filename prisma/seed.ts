/* Demo-tenant seed: the mock data layer is the seed, exactly as the
   platform ships it. Clean tenants get only the tenant row. */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../auth";
import { acInitiatives, acFeedback, acAssessments, riskRegister, kriRegister, knowledgeAssets } from "../lib/platform-models";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: { slug: "demo", name: "VerisZone Demo Center", mode: "demo" },
  });
  for (const i of acInitiatives) {
    await prisma.initiative.upsert({
      where: { id: i.id },
      update: {},
      create: {
        id: i.id, tenantId: tenant.id, name: i.name, unit: i.unit, category: i.category,
        lifecycle: i.lifecycle, businessOwner: i.businessOwner, technicalOwner: i.technicalOwner,
        sponsor: i.sponsor, champion: i.champion, cxo: i.cxo, status: i.status, priority: i.priority,
        risk: i.risk, expected: i.expected, actual: i.actual, stage: i.stage,
        guardrail: i.guardrail, adoption: i.adoption, valueScore: i.valueScore,
        roi: i.roi, savings: i.savings, revenue: i.revenue, productivity: i.productivity,
        training: i.training, resistance: i.resistance, phaseIndex: i.phaseIndex,
        phaseArtifactsDone: i.phaseArtifactsDone, blockedBy: i.blockedBy,
        policies: i.policies, controls: i.controls, audits: i.audits, risksList: i.risks,
        feedback: acFeedback[i.id] ?? undefined, assessments: acAssessments[i.id] ?? undefined,
      },
    });
  }
  for (const r of riskRegister) {
    await prisma.risk.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id, tenantId: tenant.id, initiativeId: r.initiativeId, title: r.title,
        system: r.system, category: r.category, unit: r.unit, execOwner: r.execOwner,
        riskOwner: r.riskOwner, likelihood: r.likelihood, impact: r.impact, residual: r.residual,
        level: r.level, status: r.status, frameworks: r.frameworks, controls: r.controls,
        kris: r.kris, desc: r.desc, treatment: r.treatment as object, aiRecommendation: r.aiRecommendation,
      },
    });
  }
  for (const k of kriRegister) {
    await prisma.kri.upsert({
      where: { id: k.id },
      update: {},
      create: { id: k.id, tenantId: tenant.id, name: k.name, value: k.value, unit: k.unit,
        threshold: k.threshold, direction: k.direction, trend: k.trend,
        initiativeId: k.initiativeId, framework: k.framework },
    });
  }
  for (const a of knowledgeAssets) {
    await prisma.knowledgeAsset.create({
      data: { tenantId: tenant.id, title: a.title, kind: a.kind, addedBy: a.addedBy,
        sourceRef: a.sourceRef, reuseCount: a.reuseCount ?? 0 },
    });
  }
  const roles = ["ceo","cfo","cio","coo","caio","ciso","chro","cdpo","cgo","employee","manager"];
  for (const role of roles) {
    await prisma.user.upsert({
      where: { email: `${role}@veriszone.demo` },
      update: {},
      create: { tenantId: tenant.id, email: `${role}@veriszone.demo`, name: role.toUpperCase() + " Demo", role,
        passwordHash: hashPassword("veriszone-demo", "vzdemo") },
    });
  }
  console.log("Seeded demo tenant + role users:", tenant.id);
}

main().finally(() => prisma.$disconnect());
