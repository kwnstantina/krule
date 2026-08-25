import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  KontractDocumentSchema,
  type KontractDocument,
  type KontractRule,
} from "@repo/kontract";
import type { LlmProvider, TokenUsage } from "@repo/llm";
import { ingestModule, renderCorpus, type ModuleCorpus } from "./ingest";
import { buildExtractionTask, EXTRACTION_SYSTEM_PROMPT } from "./prompts";
import {
  EXTRACTION_JSON_SCHEMA,
  ExtractionResultSchema,
  type ExtractedRule,
} from "./schema";

const run = promisify(execFile);

export interface DiscoverOptions {
  /** Directory to scan. Read-only. */
  modulePath: string;
  provider: LlmProvider;
  moduleName?: string;
  /** Overrides the detected commit. Useful when the target is not a git repo. */
  commit?: string;
}

export interface DiscoverResult {
  document: KontractDocument;
  corpus: ModuleCorpus;
  usage: TokenUsage;
  /** Rules the model returned whose provenance did not resolve; see notes. */
  droppedRules: { statement: string; reason: string }[];
}

/**
 * The sha the evidence was read at.
 *
 * `provenance.commit` is required by the kontract schema because Phase 5's drift
 * check diffs a PR against this baseline — a rule with no commit cannot be
 * compared to anything. Falls back to a marker rather than failing: the target
 * may legitimately not be a git repo.
 */
export async function detectCommit(cwd: string): Promise<string> {
  try {
    const { stdout } = await run("git", ["rev-parse", "HEAD"], { cwd });
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

function formatRuleId(index: number): string {
  return "R-" + String(index + 1).padStart(3, "0");
}

/**
 * Turns one model-returned rule into a `KontractRule`.
 *
 * Ids are assigned here, in order, rather than by the model: the schema requires
 * `R-<digits>` and the CI drift message quotes the id, so it has to be ours and
 * it has to be stable.
 */
function toKontractRule(
  rule: ExtractedRule,
  index: number,
  commit: string,
): KontractRule {
  return {
    id: formatRuleId(index),
    statement: rule.statement,
    provenance: rule.provenance.map((entry) => ({
      file: entry.file,
      line: entry.line,
      ...(entry.endLine === undefined ? {} : { endLine: entry.endLine }),
      commit,
    })),
    confidence: rule.confidence,
    origins: rule.origins,
    // Nothing is trusted until Verify proves it. Discover never sets anything else.
    status: "unverified",
    ...(rule.tags === undefined ? {} : { tags: rule.tags }),
    ...(rule.notes === undefined ? {} : { notes: rule.notes }),
  };
}

/**
 * Rejects provenance that points at a file or line the corpus does not contain.
 *
 * A hallucinated citation is worse than a missing rule: the whole value of this
 * tool is that every rule is checkable, and a plausible-looking line reference
 * that resolves to nothing quietly destroys that. Rules whose citations cannot
 * be resolved are dropped and reported, not silently kept.
 */
function resolveProvenance(
  rule: ExtractedRule,
  corpus: ModuleCorpus,
): { ok: true } | { ok: false; reason: string } {
  const byPath = new Map(corpus.files.map((file) => [file.path, file]));

  for (const entry of rule.provenance) {
    const file = byPath.get(entry.file);
    if (file === undefined) {
      return { ok: false, reason: "cites unknown file " + entry.file };
    }
    if (entry.line > file.lineCount) {
      return {
        ok: false,
        reason:
          "cites " +
          entry.file +
          ":" +
          String(entry.line) +
          " but that file has only " +
          String(file.lineCount) +
          " lines",
      };
    }
  }

  return { ok: true };
}

/**
 * `krule discover` — read a module, extract its business rules, emit a kontract.
 */
export async function discoverModule(
  options: DiscoverOptions,
): Promise<DiscoverResult> {
  const corpus = await ingestModule(options.modulePath, options.moduleName);
  const commit = options.commit ?? (await detectCommit(options.modulePath));

  const result = await options.provider.complete({
    system: EXTRACTION_SYSTEM_PROMPT,
    corpus: renderCorpus(corpus),
    task: buildExtractionTask({
      moduleName: corpus.moduleName,
      fileCount: corpus.files.length,
    }),
    jsonSchema: EXTRACTION_JSON_SCHEMA,
    schema: ExtractionResultSchema,
    schemaName: "krule-extraction-v1",
  });

  const droppedRules: DiscoverResult["droppedRules"] = [];
  const kept: ExtractedRule[] = [];

  for (const rule of result.data.rules) {
    const resolved = resolveProvenance(rule, corpus);
    if (resolved.ok) {
      kept.push(rule);
    } else {
      droppedRules.push({ statement: rule.statement, reason: resolved.reason });
    }
  }

  // Highest confidence first, so the report and any human review start with the
  // rules most likely to be real. Ids follow this order.
  kept.sort((a, b) => b.confidence - a.confidence);

  const document = KontractDocumentSchema.parse({
    kontractVersion: 1,
    module: corpus.moduleName,
    generatedAt: new Date().toISOString(),
    commit,
    rules: kept.map((rule, index) => toKontractRule(rule, index, commit)),
  });

  return { document, corpus, usage: result.usage, droppedRules };
}
