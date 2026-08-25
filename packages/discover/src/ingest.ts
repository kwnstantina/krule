import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import type { RuleOrigin } from "@repo/kontract";

export interface SourceFile {
  /** Path relative to the module root, always forward-slashed. */
  path: string;
  contents: string;
  /** Which kontract origin this file's rules count as. */
  origin: RuleOrigin;
  lineCount: number;
}

export interface ModuleCorpus {
  moduleName: string;
  root: string;
  files: SourceFile[];
}

/**
 * Which origin a file counts as, decided by extension and directory.
 *
 * This mapping is what makes the audit report's Dark Logic and Dead Rules
 * sections possible: a rule's origins come from the files it was found in, so
 * misclassifying a file here silently misclassifies every rule in it.
 */
export function classifyOrigin(relativePath: string): RuleOrigin | null {
  const segments = relativePath.split("/");
  const ext = extname(relativePath).toLowerCase();

  if (ext === ".md") return "docs";
  if (ext === ".ts" || ext === ".js" || ext === ".cs" || ext === ".vb") {
    return "code";
  }
  if (ext === ".sql") {
    // Seed data and schema are different origins even though both are .sql —
    // a CHECK constraint is a schema rule, a regularity across rows is a data
    // rule, and the report treats them differently.
    const name = segments[segments.length - 1] ?? "";
    if (name.includes("seed") || name.includes("data")) return "data";
    return "schema";
  }
  return null;
}

const SKIP_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  ".next",
  ".turbo",
]);

/**
 * Files that document the fixture's own answer key rather than the system under
 * study. Reading these would let extraction cheat, so they are excluded from
 * the corpus by name.
 */
const EXCLUDED_FILES = new Set(["PLANTED.md", "README.md"]);

async function walk(root: string, current: string): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const found: string[] = [];

  for (const entry of entries) {
    const absolute = join(current, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      found.push(...(await walk(root, absolute)));
      continue;
    }
    if (EXCLUDED_FILES.has(entry.name)) continue;
    found.push(relative(root, absolute).split(sep).join("/"));
  }

  return found;
}

/**
 * Reads a module directory into the corpus extraction reasons over.
 *
 * Read-only by contract — the brief requires extraction never to write to the
 * target system, and nothing in this module opens a file for writing.
 */
export async function ingestModule(
  root: string,
  moduleName?: string,
): Promise<ModuleCorpus> {
  const info = await stat(root).catch(() => null);
  if (info === null || !info.isDirectory()) {
    throw new Error("Module path is not a readable directory: " + root);
  }

  const relativePaths = (await walk(root, root)).sort();
  const files: SourceFile[] = [];

  for (const path of relativePaths) {
    const origin = classifyOrigin(path);
    if (origin === null) continue;
    const contents = await readFile(join(root, path), "utf8");
    files.push({
      path,
      contents,
      origin,
      lineCount: contents.split("\n").length,
    });
  }

  if (files.length === 0) {
    throw new Error(
      "No code, schema, data or docs files found under " +
        root +
        ". Expected .ts/.js/.cs/.vb, .sql, or .md files.",
    );
  }

  return {
    moduleName: moduleName ?? root.split(sep).filter(Boolean).pop() ?? "module",
    root,
    files,
  };
}

/**
 * Renders the corpus for the prompt with line numbers on every line.
 *
 * The line numbers are load-bearing, not decoration: every rule must carry
 * provenance down to a line, and the model can only cite a line it can see.
 */
export function renderCorpus(corpus: ModuleCorpus): string {
  const blocks = corpus.files.map((file) => {
    const numbered = file.contents
      .split("\n")
      .map((line, index) => String(index + 1).padStart(4, " ") + " | " + line)
      .join("\n");
    return (
      "===== FILE: " +
      file.path +
      " (origin: " +
      file.origin +
      ", " +
      String(file.lineCount) +
      " lines) =====\n" +
      numbered
    );
  });

  return (
    "MODULE: " +
    corpus.moduleName +
    "\nFILES: " +
    String(corpus.files.length) +
    "\n\n" +
    blocks.join("\n\n")
  );
}
