/* Native XLSX exports - real workbooks generated from the live data
   layer. Works with or without the database (registers ship seeded). */
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { riskRegister, acInitiatives, AC_PHASES, kriRegister } from "@/lib/platform-models";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ pack: string }> }) {
  const { pack } = await ctx.params;
  const wb = XLSX.utils.book_new();
  if (pack === "risks.xlsx") {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(riskRegister.map(r => ({
      ID: r.id, Title: r.title, System: r.system, Category: r.category, Initiative: r.initiativeId ?? "Enterprise",
      Unit: r.unit, ExecOwner: r.execOwner, RiskOwner: r.riskOwner, Likelihood: r.likelihood, Impact: r.impact,
      Inherent: r.likelihood * r.impact, Residual: r.residual, Level: r.level, Status: r.status,
      Treatment: r.treatment.strategy, TreatmentStatus: r.treatment.status, Deadline: r.treatment.deadline,
      Frameworks: r.frameworks.join("; "), Controls: r.controls.join("; "),
    }))), "Risk Register");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kriRegister.map(k => ({
      ID: k.id, Name: k.name, Value: k.value, Unit: k.unit, Threshold: k.threshold, Direction: k.direction, Trend: k.trend, Framework: k.framework,
    }))), "KRIs");
  } else if (pack === "portfolio.xlsx") {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(acInitiatives.map(i => ({
      ID: i.id, Name: i.name, Unit: i.unit, Category: i.category, Lifecycle: i.lifecycle,
      Phase: `${i.phaseIndex + 1}/${AC_PHASES.length} ${AC_PHASES[i.phaseIndex]?.name}`,
      Expected: i.expected, Realized: i.actual, ROI: i.roi, Adoption: i.adoption, ValueScore: i.valueScore,
      Guardrail: i.guardrail, Risk: i.risk, BlockedBy: i.blockedBy ?? "",
    }))), "AI Portfolio");
  } else {
    return NextResponse.json({ error: "unknown pack" }, { status: 404 });
  }
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new NextResponse(new Uint8Array(buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${pack}"`,
  }});
}
