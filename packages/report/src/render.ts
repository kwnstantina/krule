import type { KontractDocument, KontractRule, RuleStatus } from "@repo/kontract";
import {
  buildSections,
  effectiveStatus,
  type ReportVerdict,
} from "./sections";
import { REPORT_STYLES } from "./styles";

const STATUS_TONE: Record<RuleStatus, { tone: string; wash: string }> = {
  verified: { tone: "var(--verified)", wash: "var(--verified-wash)" },
  unverified: { tone: "var(--unverified)", wash: "var(--unverified-wash)" },
  contradicted: {
    tone: "var(--contradicted)",
    wash: "var(--contradicted-wash)",
  },
  drifted: { tone: "var(--drifted)", wash: "var(--drifted-wash)" },
};

const STATUS_ORDER: RuleStatus[] = [
  "verified",
  "contradicted",
  "drifted",
  "unverified",
];

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toneVars(status: RuleStatus): string {
  const { tone, wash } = STATUS_TONE[status];
  return "--tone:" + tone + ";--tone-wash:" + wash + ";";
}

/** Confidence as five discrete pips — reads as a judgement, not a percentage. */
function renderConfidence(confidence: number): string {
  const filled = Math.max(1, Math.round(confidence * 5));
  const pips = Array.from({ length: 5 }, (_, index) =>
    index < filled ? '<i class="pip on"></i>' : '<i class="pip"></i>',
  ).join("");
  return (
    '<span class="confidence"><span class="pips">' +
    pips +
    "</span>" +
    confidence.toFixed(2) +
    "</span>"
  );
}

function renderRule(
  rule: KontractRule,
  status: RuleStatus,
  reason: string | undefined,
): string {
  const citations = rule.provenance
    .map(
      (entry) =>
        '<span class="citation">' +
        escapeHtml(entry.file) +
        ":" +
        String(entry.line) +
        (entry.endLine === undefined ? "" : "-" + String(entry.endLine)) +
        "</span>",
    )
    .join("");

  return (
    '<article class="rule" style="' +
    toneVars(status) +
    '">' +
    '<div class="rule-id">' +
    escapeHtml(rule.id) +
    "</div>" +
    "<div>" +
    '<p class="statement">' +
    escapeHtml(rule.statement) +
    "</p>" +
    '<div class="meta">' +
    '<span class="verdict">' +
    status +
    "</span>" +
    renderConfidence(rule.confidence) +
    '<span class="origins">' +
    rule.origins.map(escapeHtml).join(" · ") +
    "</span>" +
    citations +
    "</div>" +
    (rule.notes === undefined
      ? ""
      : '<p class="notes">' + escapeHtml(rule.notes) + "</p>") +
    (reason === undefined
      ? ""
      : '<p class="reason">' + escapeHtml(reason) + "</p>") +
    "</div>" +
    "</article>"
  );
}

function renderSection(options: {
  numeral: string;
  title: string;
  note: string;
  emptyMessage: string;
  rules: KontractRule[];
  verdicts: ReportVerdict[];
  reasons: Map<string, string>;
}): string {
  const body =
    options.rules.length === 0
      ? '<p class="empty">' + escapeHtml(options.emptyMessage) + "</p>"
      : options.rules
          .map((rule) =>
            renderRule(
              rule,
              effectiveStatus(rule, options.verdicts),
              options.reasons.get(rule.id),
            ),
          )
          .join("");

  return (
    "<section>" +
    '<div class="section-head">' +
    '<span class="section-numeral">' +
    options.numeral +
    "</span>" +
    "<h2>" +
    escapeHtml(options.title) +
    "</h2>" +
    '<span class="section-count">' +
    String(options.rules.length) +
    "</span>" +
    "</div>" +
    '<p class="section-note">' +
    escapeHtml(options.note) +
    "</p>" +
    body +
    "</section>"
  );
}

export interface RenderOptions {
  document: KontractDocument;
  verdicts?: ReportVerdict[];
  /** How the rules were produced — shown in the footer for provenance. */
  providerLabel?: string;
}

/**
 * Renders `audit-report.html`: one self-contained file, no external requests.
 *
 * The four sections are the ones the brief specifies. They are derived, not
 * stored: Dark Logic and Dead Rules come from each rule's `origins`, and
 * Contradictions from the verify verdicts.
 */
export function renderReport(options: RenderOptions): string {
  const verdicts = options.verdicts ?? [];
  const sections = buildSections(options.document, verdicts);
  const doc = options.document;

  const tally = STATUS_ORDER.map((status) => {
    const { tone } = STATUS_TONE[status];
    return (
      '<div class="tally-cell" style="--tone:' +
      tone +
      '">' +
      '<div class="tally-count">' +
      String(sections.counts[status]) +
      "</div>" +
      '<div class="tally-label">' +
      status +
      "</div>" +
      "</div>"
    );
  }).join("");

  const shared = { verdicts, reasons: sections.reasons };

  return (
    "<!doctype html>\n" +
    '<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    "<title>Business Logic Audit — " +
    escapeHtml(doc.module) +
    "</title>\n<style>" +
    REPORT_STYLES +
    "</style>\n</head>\n<body>\n" +
    '<div class="shell">' +
    '<header class="masthead">' +
    '<p class="eyebrow">Business logic observability</p>' +
    "<h1>Rule audit<span class=\"module\">" +
    escapeHtml(doc.module) +
    "</span></h1>" +
    '<p class="provenance-line">' +
    "<span><b>" +
    String(doc.rules.length) +
    "</b> rules extracted</span>" +
    "<span>commit <b>" +
    escapeHtml(doc.commit.slice(0, 12)) +
    "</b></span>" +
    "<span>generated <b>" +
    escapeHtml(doc.generatedAt) +
    "</b></span>" +
    "<span>kontract v<b>" +
    String(doc.kontractVersion) +
    "</b></span>" +
    "</p>" +
    "</header>" +
    '<div class="tally">' +
    tally +
    "</div>" +
    renderSection({
      numeral: "I",
      title: "Rule inventory",
      note:
        "Every business rule recovered from the module, ordered by extraction confidence. " +
        "Each carries the file and line it was found at, so any statement here can be checked against the source.",
      emptyMessage: "No rules extracted.",
      rules: sections.inventory,
      ...shared,
    }) +
    renderSection({
      numeral: "II",
      title: "Contradiction report",
      note:
        "Rules where two sources disagree. The verdict line names the value the code applies and the value the other source states. " +
        "These are the highest-priority findings: documentation that confidently states the wrong threshold is worse than no documentation.",
      emptyMessage:
        "No contradictions found. Every rule's sources agree on the values they state.",
      rules: sections.contradictions,
      ...shared,
    }) +
    renderSection({
      numeral: "III",
      title: "Dark logic",
      note:
        "Rules the system enforces that the documentation never mentions. Undocumented behaviour a compliance regime would expect to see written down.",
      emptyMessage:
        "No dark logic found. Every implemented rule is described somewhere in the documentation.",
      rules: sections.darkLogic,
      ...shared,
    }) +
    renderSection({
      numeral: "IV",
      title: "Dead rules",
      note:
        "Rules the documentation describes that nothing implements. Either the behaviour was removed and the documentation was not, or it was never built.",
      emptyMessage:
        "No dead rules found. Every documented rule has an implementation.",
      rules: sections.deadRules,
      ...shared,
    }) +
    "<footer>" +
    escapeHtml(
      "Generated by krule report from rules.kontract.yaml. " +
        (options.providerLabel === undefined
          ? ""
          : "Extraction: " + options.providerLabel + ". "),
    ) +
    "<br>Verdicts come from evidence verification: each rule's cited lines are re-read and the values its statement asserts are checked against them. " +
    "A verified rule is one whose citation supports its statement — it is not proof the code path executes." +
    "</footer>" +
    "</div>\n</body>\n</html>\n"
  );
}
