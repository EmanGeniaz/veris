/* EU AI Act Article 5 — the eight prohibited practices ("red lines").
   These are a STOP, not a control: if a system is in scope you do not govern
   it and you do not deploy it. Screening every system against the eight is the
   first gate, before any risk tiering. Results are assessed against the live
   estate so the screen agrees with the AI system register. */

export const PROHIBITED_PRACTICES = [
  { id: "P1", art: "Art. 5(1)(a)", practice: "Subliminal or manipulative techniques", catches: "Techniques beyond a person's awareness that materially distort behaviour and cause significant harm.", everyday: false, result: "clear", system: "—", note: "No persuasion or nudging system in the estate operates below user awareness." },
  { id: "P2", art: "Art. 5(1)(b)", practice: "Exploiting vulnerabilities", catches: "Exploiting age, disability or socio-economic situation to distort behaviour.", everyday: false, result: "clear", system: "—", note: "No system targets a protected vulnerable group." },
  { id: "P3", art: "Art. 5(1)(c)", practice: "Social scoring", catches: "General-purpose scoring of people from unrelated behaviour that leads to detrimental treatment.", everyday: false, result: "clear", system: "Credit Decision Assurance", note: "Credit scoring is regulated high-risk (Annex III), NOT Art. 5 social scoring — confirmed scoped-out." },
  { id: "P4", art: "Art. 5(1)(d)", practice: "Predictive policing from profiling", catches: "Predicting criminal offending from profiling or personality traits alone.", everyday: false, result: "clear", system: "—", note: "No law-enforcement or offence-prediction use." },
  { id: "P5", art: "Art. 5(1)(e)", practice: "Untargeted facial-image scraping", catches: "Building or expanding facial-recognition databases by untargeted scraping of the web or CCTV.", everyday: false, result: "clear", system: "—", note: "No facial-recognition database is built or expanded." },
  { id: "P6", art: "Art. 5(1)(f)", practice: "Emotion recognition at work or in education", catches: "Inferring the emotions of employees or students — the red line that catches ordinary enterprises through HR and productivity tooling.", everyday: true, result: "review", system: "Workforce Skills Navigator · Sentiment & Feedback", note: "Confirm the sentiment tooling classifies feedback text only and does NOT infer individual employee emotions. Attestation is blocked until confirmed." },
  { id: "P7", art: "Art. 5(1)(g)", practice: "Biometric categorisation of sensitive traits", catches: "Inferring race, political opinion, union membership, religion, sex life or sexual orientation from biometric data.", everyday: false, result: "clear", system: "—", note: "No biometric categorisation in the estate." },
  { id: "P8", art: "Art. 5(1)(h)", practice: "Real-time remote biometric identification", catches: "Live remote biometric identification in public spaces for law enforcement (narrow exceptions only).", everyday: false, result: "clear", system: "—", note: "Not a law-enforcement operator; no public-space biometric identification." },
];

export const PP_RESULT_META = {
  clear:  { label: "Clear",         tone: "good" },
  review: { label: "Under review",  tone: "warn" },
  flag:   { label: "In scope — stop", tone: "crit" },
};

export function prohibitedStats() {
  const clear  = PROHIBITED_PRACTICES.filter(p => p.result === "clear").length;
  const review = PROHIBITED_PRACTICES.filter(p => p.result === "review").length;
  const flag   = PROHIBITED_PRACTICES.filter(p => p.result === "flag").length;
  return { total: PROHIBITED_PRACTICES.length, clear, review, flag, attested: review === 0 && flag === 0 };
}
