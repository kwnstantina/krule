import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseKontract, type RuleOrigin, type RuleStatus } from "@repo/kontract";
import { verifyDocument } from "@repo/verify";
import { isDarkLogic, isDeadRule } from "@repo/report";

/**
 * Audits the web app can show. Each one is a kontract produced by the CLI plus
 * the module source it cites, so the workspace can re-run Verify and quote the
 * cited lines rather than trusting statuses copied into the file.
 */
interface AuditSource {
  module: string;
  title: string;
  summary: string;
  /** Relative to the web app's root (process.cwd() under next dev/build). */
  kontractPath: string;
  sourceRoot: string;
  /** True when extraction came from an answer key rather than a model. */
  simulatedExtraction: boolean;
}

const AUDITS: AuditSource[] = [
  {
    module: "legacy-claims",
    title: "Legacy claims authorisation",
    summary:
      "A claims module with rules spread across TypeScript, a SQL schema, seed data and two internal wikis.",
    kontractPath: "data/audits/legacy-claims.kontract.yaml",
    sourceRoot: "../../fixtures/legacy-claims",
    simulatedExtraction: true,
  },
];

const EXCERPT_CONTEXT = 2;

export type RuleKind = "dark-logic" | "dead-rule";

export interface ExcerptLine {
  n: number;
  text: string;
  cited: boolean;
}

export interface SourceView {
  file: string;
  line: number;
  endLine?: number;
  commit: string;
  /** Empty when the cited file could not be read. */
  excerpt: ExcerptLine[];
}

export interface RuleView {
  id: string;
  statement: string;
  status: RuleStatus;
  reason: string;
  confidence: number;
  origins: RuleOrigin[];
  kind: RuleKind | null;
  notes?: string;
  sources: SourceView[];
  conflicting: { file: string; line: number; value: number }[];
}

export interface AuditView {
  module: string;
  title: string;
  summary: string;
  commit: string;
  generatedAt: string;
  sourceLabel: string;
  simulatedExtraction: boolean;
  counts: Record<RuleStatus, number>;
  rules: RuleView[];
}

export interface AuditListing {
  module: string;
  title: string;
  summary: string;
  ruleCount: number;
  counts: Record<RuleStatus, number>;
}

function resolve(path: string): string {
  return join(process.cwd(), path);
}

async function readLines(root: string, file: string): Promise<string[] | null> {
  try {
    const contents = await readFile(join(root, file), "utf8");
    return contents.replace(/\r\n/g, "\n").split("\n");
  } catch {
    return null;
  }
}

export function auditModules(): string[] {
  return AUDITS.map((audit) => audit.module);
}

export async function loadAudit(module: string): Promise<AuditView | null> {
  const source = AUDITS.find((audit) => audit.module === module);
  if (!source) return null;

  const document = parseKontract(await readFile(resolve(source.kontractPath), "utf8"));
  const sourceRoot = resolve(source.sourceRoot);
  const { verdicts, counts } = await verifyDocument(document, sourceRoot);
  const verdictById = new Map(verdicts.map((verdict) => [verdict.id, verdict]));

  const fileCache = new Map<string, string[] | null>();
  const linesOf = async (file: string) => {
    if (!fileCache.has(file)) fileCache.set(file, await readLines(sourceRoot, file));
    return fileCache.get(file) ?? null;
  };

  const rules: RuleView[] = [];
  for (const rule of document.rules) {
    const verdict = verdictById.get(rule.id);
    const sources: SourceView[] = [];
    for (const entry of rule.provenance) {
      const lines = await linesOf(entry.file);
      const last = entry.endLine ?? entry.line;
      const excerpt: ExcerptLine[] = [];
      if (lines) {
        const from = Math.max(1, entry.line - EXCERPT_CONTEXT);
        const to = Math.min(lines.length, last + EXCERPT_CONTEXT);
        for (let n = from; n <= to; n++) {
          excerpt.push({ n, text: lines[n - 1] ?? "", cited: n >= entry.line && n <= last });
        }
      }
      sources.push({ ...entry, excerpt });
    }

    rules.push({
      id: rule.id,
      statement: rule.statement,
      // The verdict from this run wins over the stored status, as in the report.
      status: verdict?.status ?? rule.status,
      reason: verdict?.reason ?? "Not verified in this run.",
      confidence: rule.confidence,
      origins: rule.origins,
      kind: isDarkLogic(rule) ? "dark-logic" : isDeadRule(rule) ? "dead-rule" : null,
      notes: rule.notes,
      sources,
      conflicting: verdict?.conflicting ?? [],
    });
  }

  return {
    module: document.module,
    title: source.title,
    summary: source.summary,
    commit: document.commit,
    generatedAt: document.generatedAt,
    sourceLabel: source.sourceRoot.replace(/^(\.\.\/)+/, ""),
    simulatedExtraction: source.simulatedExtraction,
    counts,
    rules,
  };
}

export async function listAudits(): Promise<AuditListing[]> {
  const listings: AuditListing[] = [];
  for (const name of auditModules()) {
    const audit = await loadAudit(name);
    if (!audit) continue;
    listings.push({
      module: audit.module,
      title: audit.title,
      summary: audit.summary,
      ruleCount: audit.rules.length,
      counts: audit.counts,
    });
  }
  return listings;
}
