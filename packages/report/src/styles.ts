/**
 * Styles for `audit-report.html`.
 *
 * Designed as a document, not a dashboard: auditors print these, so page-break
 * control and a print palette are first-class rather than an afterthought. That
 * constraint is also why there is almost no motion — a compliance artefact that
 * animates reads as a toy.
 *
 * Three type roles, each meaning something:
 *   - serif (Georgia) for rule statements — the human-language claim
 *   - grotesque (platform UI face) for chrome, labels and counts
 *   - monospace for every coordinate, value and identifier
 *
 * Everything self-contained: no webfonts, no CDN, no external requests.
 */
export const REPORT_STYLES = `
:root {
  --paper: #e9edf1;
  --card: #f7f9fa;
  --ink: #131c26;
  --ink-soft: #47566a;
  --ink-faint: #7b8798;
  --rule: #ccd6e0;
  --rule-firm: #a9b7c6;
  --structure: #3d4e6b;

  --verified: #0f6b5c;
  --verified-wash: #dfeeea;
  --unverified: #64748b;
  --unverified-wash: #e6eaee;
  --contradicted: #a3243b;
  --contradicted-wash: #f5e2e5;
  --drifted: #8a5a0b;
  --drifted-wash: #f5eadb;

  --serif: Georgia, "Iowan Old Style", "Palatino Linotype", Palatino, "Times New Roman", serif;
  --sans: "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
  --mono: ui-monospace, "Cascadia Mono", "Cascadia Code", Consolas, "SF Mono", Menlo, "DejaVu Sans Mono", monospace;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #101821;
    --card: #17202b;
    --ink: #e7edf3;
    --ink-soft: #a7b5c4;
    --ink-faint: #78889a;
    --rule: #2a3745;
    --rule-firm: #3d4d5e;
    --structure: #8da4c6;

    --verified: #4fbfa5;
    --verified-wash: #12302b;
    --unverified: #8798ab;
    --unverified-wash: #1d2732;
    --contradicted: #f0798f;
    --contradicted-wash: #331820;
    --drifted: #d9a44a;
    --drifted-wash: #2e2415;
  }
}

:root[data-theme="dark"] {
  --paper: #101821;
  --card: #17202b;
  --ink: #e7edf3;
  --ink-soft: #a7b5c4;
  --ink-faint: #78889a;
  --rule: #2a3745;
  --rule-firm: #3d4d5e;
  --structure: #8da4c6;

  --verified: #4fbfa5;
  --verified-wash: #12302b;
  --unverified: #8798ab;
  --unverified-wash: #1d2732;
  --contradicted: #f0798f;
  --contradicted-wash: #331820;
  --drifted: #d9a44a;
  --drifted-wash: #2e2415;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.shell {
  max-width: 62rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 6rem;
}

/* ---------- masthead ---------- */

.masthead {
  border-bottom: 2px solid var(--ink);
  padding-bottom: 1.25rem;
  margin-bottom: 0.5rem;
}

.eyebrow {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0 0 0.75rem;
}

h1 {
  font-family: var(--sans);
  font-size: clamp(1.9rem, 5vw, 2.9rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.05;
  margin: 0 0 0.85rem;
}

h1 .module {
  font-family: var(--mono);
  font-weight: 500;
  font-size: 0.5em;
  letter-spacing: 0;
  color: var(--structure);
  display: block;
  margin-top: 0.5rem;
}

.provenance-line {
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
  margin: 0;
}

.provenance-line span { white-space: nowrap; }
.provenance-line b { font-weight: 600; color: var(--ink); }

/* ---------- tally ---------- */

.tally {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 1px;
  background: var(--rule);
  border: 1px solid var(--rule);
  margin: 2rem 0 3rem;
}

.tally-cell {
  background: var(--card);
  padding: 0.9rem 1rem;
  border-top: 3px solid var(--tone, var(--rule-firm));
}

.tally-count {
  font-family: var(--mono);
  font-size: 1.9rem;
  font-weight: 600;
  line-height: 1;
  color: var(--tone, var(--ink));
  font-variant-numeric: tabular-nums;
}

.tally-label {
  font-size: 0.72rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-top: 0.45rem;
}

/* ---------- sections ---------- */

section { margin-bottom: 3.5rem; }

.section-head {
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
  border-bottom: 1px solid var(--rule-firm);
  padding-bottom: 0.5rem;
  margin-bottom: 0.4rem;
}

.section-numeral {
  font-family: var(--mono);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--structure);
  letter-spacing: 0.06em;
}

h2 {
  font-size: 1.12rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
  flex: 1;
}

.section-count {
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--ink-faint);
  font-variant-numeric: tabular-nums;
}

.section-note {
  font-size: 0.86rem;
  color: var(--ink-soft);
  margin: 0.7rem 0 1.4rem;
  max-width: 46rem;
}

/* ---------- the verdict spine ---------- */

.rule {
  display: grid;
  grid-template-columns: 4.6rem 1fr;
  gap: 0 1.1rem;
  padding: 1rem 1.1rem 1rem 0.9rem;
  border-left: 4px solid var(--tone, var(--rule-firm));
  border-bottom: 1px solid var(--rule);
  background: var(--card);
  break-inside: avoid;
}

.rule-id {
  font-family: var(--mono);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-soft);
  padding-top: 0.15rem;
  font-variant-numeric: tabular-nums;
}

.statement {
  font-family: var(--serif);
  font-size: 1.02rem;
  line-height: 1.45;
  margin: 0 0 0.7rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.75rem;
}

.verdict {
  font-family: var(--mono);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tone);
  background: var(--tone-wash);
  border: 1px solid var(--tone);
  padding: 0.16rem 0.5rem;
  white-space: nowrap;
}

.origins {
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
}

.citation {
  font-family: var(--mono);
  font-size: 0.74rem;
  color: var(--structure);
  border-bottom: 1px solid var(--rule-firm);
  white-space: nowrap;
}

/* confidence as five discrete blocks — a meter, not a progress bar */
.confidence {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--ink-faint);
  font-variant-numeric: tabular-nums;
}
.pips { display: inline-flex; gap: 2px; }
.pip {
  width: 6px;
  height: 11px;
  background: var(--rule-firm);
}
.pip.on { background: var(--tone, var(--structure)); }

.reason {
  font-family: var(--mono);
  font-size: 0.74rem;
  color: var(--ink-soft);
  margin: 0.6rem 0 0;
  padding-left: 0.7rem;
  border-left: 2px solid var(--rule);
}

.notes {
  font-family: var(--serif);
  font-style: italic;
  font-size: 0.9rem;
  color: var(--ink-soft);
  margin: 0.6rem 0 0;
}

.empty {
  font-family: var(--mono);
  font-size: 0.82rem;
  color: var(--ink-faint);
  background: var(--card);
  border: 1px dashed var(--rule-firm);
  padding: 1.1rem 1.2rem;
}

footer {
  margin-top: 4rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--rule-firm);
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--ink-faint);
  line-height: 1.7;
}

/* ---------- print ---------- */

@media print {
  :root {
    --paper: #fff;
    --card: #fff;
    --ink: #000;
    --ink-soft: #333;
    --ink-faint: #555;
    --rule: #ccc;
    --rule-firm: #999;
  }
  body { font-size: 10.5pt; }
  .shell { max-width: none; padding: 0; }
  section { break-inside: auto; }
  .section-head { break-after: avoid; }
  .rule { break-inside: avoid; background: #fff; }
  .tally { break-inside: avoid; }
  footer { break-before: avoid; }
}

@media (max-width: 34rem) {
  .rule { grid-template-columns: 1fr; gap: 0.4rem; }
  .rule-id { padding-top: 0; }
}
`;
