/* ── Assistant honesty layer (#168 / WS3) ────────────────────────────────────
   The employee assistant (components/platform/workbench.jsx) routes prompts to
   the real governed gateway (/api/gateway/chat). When a model is configured the
   reply is a genuine, governed model answer; when one is NOT (gateway returns
   {enabled:false}, or it is unreachable) the workspace still needs to answer —
   but it must NEVER dress that local, simulated reply up as real model work.

   This module is the single, pure, testable source of that honesty: the
   provenance of every assistant turn (live model / locally simulated / blocked
   at the boundary / declined as out-of-scope) and the copy for each, so the
   simulated path states plainly that no model ran instead of claiming it
   "routed to {provider}". Same discipline as the TelemetryBadge (live vs demo)
   and the Evidence Fabric provenance stamp. */

export type ProvenanceTone = "live" | "demo" | "bad" | "muted";
export type ProvenanceKey = "live" | "simulated" | "blocked" | "declined";
export type ProvenanceDescriptor = { key: ProvenanceKey; label: string; tone: ProvenanceTone; ar: string };

/* The provenance of an assistant turn. `tone` maps to the surface's palette
   (live=green, demo=amber, bad=red, muted=grey). */
export const ASSISTANT_PROVENANCE: Record<ProvenanceKey, ProvenanceDescriptor> = {
  live:      { key: "live",      label: "Governed · Live",         tone: "live",  ar: "محوكَم · مباشر" },
  simulated: { key: "simulated", label: "Simulated · no model",    tone: "demo",  ar: "محاكاة · لا نموذج" },
  blocked:   { key: "blocked",   label: "Blocked at boundary",     tone: "bad",   ar: "محجوب عند الحدود" },
  declined:  { key: "declined",  label: "Declined · out of scope", tone: "muted", ar: "مرفوض · خارج النطاق" },
};

/* Resolve a provenance descriptor (falls back to simulated — never overclaims live). */
export function assistantProvenance(key?: string): ProvenanceDescriptor {
  return ASSISTANT_PROVENANCE[key as ProvenanceKey] || ASSISTANT_PROVENANCE.simulated;
}

/* Which provenance an allowed turn has: live only when the gateway actually
   returned a model answer; otherwise it is a local simulation. */
export function allowedProvenance(gotLiveModelAnswer: boolean): ProvenanceKey {
  return gotLiveModelAnswer ? "live" : "simulated";
}

/* The honest simulated reply — used ONLY when no live model answered. It never
   claims a model call or provider routing; it states that the reply was
   generated locally, while still crediting the real local governance (the
   policy check and any masking that DID run at the boundary). */
export function honestSimulatedReply(opts: { ar?: boolean; artifact?: boolean; masked?: boolean } = {}): string {
  const { ar = false, artifact = false, masked = false } = opts;
  if (ar) {
    const lead = artifact ? "هذه مسودة محاكاة. " : "";
    const mask = masked ? " وجرى تقنيع البيانات الحسّاسة" : "";
    return `${lead}رد محاكاة — لا يوجد نموذج مباشر متصل بمساحة العمل هذه، لذا وُلِّد هذا الرد محلياً وليس بواسطة نموذج. مع ذلك جرى فحص طلبك مقابل السياسة${mask} عند حدود المؤسسة. اربط نموذجاً بالبوابة للحصول على إجابة محوكَمة مدعومة بنموذج.`;
  }
  const lead = artifact ? "This is a simulated draft. " : "";
  const mask = masked ? " and sensitive data was masked" : "";
  return `${lead}Simulated response — no live model is connected to this workspace, so this reply was generated locally, not by a model. Your prompt was still checked against policy${mask} at the enterprise boundary. Connect a model to the gateway for a governed, model-backed answer.`;
}

/* The suffix appended to a genuine live gateway answer — accurate provenance. */
export function liveReplySuffix(opts: { ar?: boolean; source?: string; masked?: boolean } = {}): string {
  const { ar = false, source = "enterprise knowledge", masked = false } = opts;
  if (ar) return `\n\n— المصدر: ${source} · موجَّه عبر بوابة المؤسسة${masked ? " · جرى تقنيع البيانات الحسّاسة عند الحدود" : ""}`;
  return `\n\n— Source: ${source} · routed via the enterprise gateway${masked ? " · sensitive data masked at the boundary" : ""}`;
}
