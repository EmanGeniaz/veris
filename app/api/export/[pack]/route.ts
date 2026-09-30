/* Native XLSX exports - real workbooks generated from the live data
   layer. Works with or without the database (registers ship seeded).
   Written with exceljs: the npm `xlsx` (SheetJS 0.18.5) package carries
   unfixed prototype-pollution + ReDoS advisories and has no patched npm
   release, so it was replaced (security baseline · dependency audit). */
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { riskRegister, acInitiatives, AC_PHASES, kriRegister } from "@/lib/platform-models";

type Row = Record<string, unknown>;

/* One sheet from uniform row objects — the header row is the first row's keys
   (the same shape json_to_sheet produced). */
function addSheet(wb: ExcelJS.Workbook, name: string, rows: Row[]) {
  const ws = wb.addWorksheet(name);
  const keys = rows.length ? Object.keys(rows[0]) : [];
  ws.columns = keys.map((k) => ({ header: k, key: k }));
  ws.addRows(rows);
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ pack: string }> }) {
  const { pack } = await ctx.params;
  const wb = new ExcelJS.Workbook();
  if (pack === "risks.xlsx") {
    addSheet(wb, "Risk Register", riskRegister.map(r => ({
      ID: r.id, Title: r.title, System: r.system, Category: r.category, Initiative: r.initiativeId ?? "Enterprise",
      Unit: r.unit, ExecOwner: r.execOwner, RiskOwner: r.riskOwner, Likelihood: r.likelihood, Impact: r.impact,
      Inherent: r.likelihood * r.impact, Residual: r.residual, Level: r.level, Status: r.status,
      Treatment: r.treatment.strategy, TreatmentStatus: r.treatment.status, Deadline: r.treatment.deadline,
      Frameworks: r.frameworks.join("; "), Controls: r.controls.join("; "),
    })));
    addSheet(wb, "KRIs", kriRegister.map(k => ({
      ID: k.id, Name: k.name, Value: k.value, Unit: k.unit, Threshold: k.threshold, Direction: k.direction, Trend: k.trend, Framework: k.framework,
    })));
  } else if (pack === "portfolio.xlsx") {
    addSheet(wb, "AI Portfolio", acInitiatives.map(i => ({
      ID: i.id, Name: i.name, Unit: i.unit, Category: i.category, Lifecycle: i.lifecycle,
      Phase: `${i.phaseIndex + 1}/${AC_PHASES.length} ${AC_PHASES[i.phaseIndex]?.name}`,
      Expected: i.expected, Realized: i.actual, ROI: i.roi, Adoption: i.adoption, ValueScore: i.valueScore,
      Guardrail: i.guardrail, Risk: i.risk, BlockedBy: i.blockedBy ?? "",
    })));
  } else {
    return NextResponse.json({ error: "unknown pack" }, { status: 404 });
  }
  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buf as ArrayBuffer), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${pack}"`,
  }});
}
