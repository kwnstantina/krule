#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { discoverModule } from "@repo/discover";
import {
  readKontractFile,
  serializeKontract,
  updateRuleStatuses,
} from "@repo/kontract";
import { createProvider, describeProvider } from "@repo/llm";
import { renderReport } from "@repo/report";
import { toStatusMap, verifyDocument } from "@repo/verify";
import { DEMO_BANNER, loadAnswerKeyKontract } from "./demo";
import { loadPlanted, scoreAgainstPlanted } from "./score";
import { readFile } from "node:fs/promises";

const KONTRACT_FILE = "rules.kontract.yaml";
const REPORT_FILE = "audit-report.html";

interface Args {
  command: string;
  modulePath: string;
  out: string;
  flags: Set<string>;
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const flags = new Set<string>();
  let out = ".";

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === undefined) continue;
    if (value === "--out" || value === "-o") {
      out = argv[index + 1] ?? ".";
      index += 1;
    } else if (value.startsWith("--")) {
      flags.add(value.slice(2));
    } else {
      positional.push(value);
    }
  }

  return {
    command: positional[0] ?? "help",
    modulePath: positional[1] ?? "fixtures/legacy-claims",
    out,
    flags,
  };
}

const HELP = `krule — business logic observability

  krule discover <module>   Extract business rules into ${KONTRACT_FILE}
  krule verify <module>     Check each rule against its cited source, write statuses back
  krule report <module>     Render ${REPORT_FILE} from the kontract
  krule score <module>      Score the kontract against the fixture's PLANTED.md answer key
  krule audit <module>      discover, verify, report and score in one pass
  krule demo <module>       Same pipeline with extraction simulated from the answer
                            key, for running without an API key

Options
  --out <dir>               Where to write artifacts (default: current directory)

Environment
  ANTHROPIC_API_KEY         Enables live extraction. Without it, krule replays a
                            recorded response and never touches the network.
  KRULE_LLM                 anthropic | recorded | auto   (default: auto)
  KRULE_EFFORT              low | medium | high | xhigh | max   (default: high)
  KRULE_CACHE_DIR           Where recorded responses live (default: .krule-cache)
`;

function bar(count: number, total: number, width = 24): string {
  if (total === 0) return "";
  const filled = Math.round((count / total) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

async function commandDiscover(args: Args): Promise<void> {
  const provider = createProvider();
  process.stdout.write(
    "  provider  " + describeProvider(provider) + "\n  module    " + args.modulePath + "\n\n",
  );

  const started = Date.now();
  const result = await discoverModule({
    modulePath: args.modulePath,
    provider,
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  const originCounts = new Map<string, number>();
  for (const rule of result.document.rules) {
    for (const origin of rule.origins) {
      originCounts.set(origin, (originCounts.get(origin) ?? 0) + 1);
    }
  }

  const target = join(args.out, KONTRACT_FILE);
  await writeFile(target, serializeKontract(result.document), "utf8");

  process.stdout.write(
    "  " +
      String(result.document.rules.length) +
      " rules extracted in " +
      seconds +
      "s  (" +
      [...originCounts.entries()]
        .sort()
        .map(([origin, count]) => origin + " " + String(count))
        .join(", ") +
      ")\n",
  );

  if (result.droppedRules.length > 0) {
    process.stdout.write(
      "  " +
        String(result.droppedRules.length) +
        " dropped for unresolvable provenance:\n",
    );
    for (const dropped of result.droppedRules) {
      process.stdout.write("    - " + dropped.reason + "\n");
    }
  }

  process.stdout.write(
    "  tokens    in " +
      String(result.usage.inputTokens) +
      ", out " +
      String(result.usage.outputTokens) +
      ", cache read " +
      String(result.usage.cacheReadTokens) +
      "\n  → " +
      target +
      "\n",
  );
}

async function commandVerify(args: Args): Promise<void> {
  const path = join(args.out, KONTRACT_FILE);
  const document = await readKontractFile(path);
  const result = await verifyDocument(document, args.modulePath);

  const total = document.rules.length;
  for (const status of [
    "verified",
    "contradicted",
    "drifted",
    "unverified",
  ] as const) {
    process.stdout.write(
      "  " +
        status.padEnd(13) +
        String(result.counts[status]).padStart(3) +
        "  " +
        bar(result.counts[status], total) +
        "\n",
    );
  }

  // Rewrite statuses through the YAML AST so any reviewer comments in the file
  // survive. A parse-mutate-serialize round trip would silently drop them.
  const original = await readFile(path, "utf8");
  await writeFile(
    path,
    updateRuleStatuses(original, toStatusMap(result)),
    "utf8",
  );

  const notable = result.verdicts.filter(
    (verdict) =>
      verdict.status === "contradicted" || verdict.status === "drifted",
  );
  if (notable.length > 0) {
    process.stdout.write("\n  findings\n");
    for (const verdict of notable) {
      process.stdout.write(
        "    " +
          verdict.id +
          "  " +
          verdict.status.toUpperCase() +
          "  " +
          verdict.reason +
          "\n",
      );
    }
  }

  process.stdout.write("\n  → " + path + " (statuses updated)\n");
}

async function commandReport(args: Args): Promise<void> {
  const path = join(args.out, KONTRACT_FILE);
  const document = await readKontractFile(path);
  const verification = await verifyDocument(document, args.modulePath);

  const html = renderReport({
    document,
    verdicts: verification.verdicts,
  });

  const target = join(args.out, REPORT_FILE);
  await writeFile(target, html, "utf8");

  process.stdout.write(
    "  → " +
      target +
      "\n  open it with: start " +
      target +
      "\n",
  );
}

async function commandScore(args: Args): Promise<void> {
  const document = await readKontractFile(join(args.out, KONTRACT_FILE));
  const planted = await loadPlanted(join(args.modulePath, "PLANTED.md"));

  if (planted.length === 0) {
    process.stdout.write(
      "  no PLANTED.md answer key found under " +
        args.modulePath +
        " — scoring only works on the synthetic fixture\n",
    );
    return;
  }

  const score = scoreAgainstPlanted(document, planted);
  const percent = (score.recall * 100).toFixed(1);

  process.stdout.write(
    "  planted   " +
      String(score.planted) +
      "\n  extracted " +
      String(score.extracted) +
      "\n  matched   " +
      String(score.matched) +
      "\n  recall    " +
      percent +
      "%  " +
      bar(score.matched, score.planted) +
      "\n  threshold 80.0%  " +
      (score.recall >= 0.8 ? "PASS" : "BELOW TARGET") +
      "\n",
  );

  if (score.missed.length > 0) {
    process.stdout.write("\n  not found\n");
    for (const rule of score.missed) {
      process.stdout.write(
        "    " +
          rule.id +
          "  [" +
          rule.classification +
          "]  " +
          rule.statement.slice(0, 78) +
          "\n",
      );
    }
  }
}

async function commandDemo(args: Args): Promise<void> {
  process.stdout.write(DEMO_BANNER + "\n");

  const document = await loadAnswerKeyKontract(args.modulePath);
  const target = join(args.out, KONTRACT_FILE);
  await writeFile(target, serializeKontract(document), "utf8");
  process.stdout.write(
    "  " +
      String(document.rules.length) +
      " rules loaded from the answer key\n  → " +
      target +
      "\n",
  );

  process.stdout.write("\nverify   (real — re-reads the fixture source)\n");
  await commandVerify(args);
  process.stdout.write("\nreport   (real)\n");
  await commandReport(args);
  process.stdout.write("\nscore    (circular in demo mode — see below)\n");
  await commandScore(args);
  // Scoring the answer key against the answer key is 100% by construction. Say
  // so rather than letting a meaningless number look like a result.
  process.stdout.write(
    "\n  NOTE  In demo mode the input to scoring IS the answer key, so 100%\n" +
      "        is guaranteed and measures nothing. The score is only\n" +
      "        meaningful after a real krule discover run.\n",
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const resolvedModule = resolve(args.modulePath);
  const withResolved: Args = { ...args, modulePath: resolvedModule };

  // Commands that create the kontract would otherwise fail with ENOENT when
  // --out names a directory that does not exist yet.
  if (["discover", "demo", "audit"].includes(args.command)) {
    await mkdir(args.out, { recursive: true });
  }

  switch (args.command) {
    case "discover":
      await commandDiscover(withResolved);
      break;
    case "verify":
      await commandVerify(withResolved);
      break;
    case "report":
      await commandReport(withResolved);
      break;
    case "score":
      await commandScore(withResolved);
      break;
    case "demo":
      await commandDemo(withResolved);
      break;
    case "audit":
      process.stdout.write("\ndiscover\n");
      await commandDiscover(withResolved);
      process.stdout.write("\nverify\n");
      await commandVerify(withResolved);
      process.stdout.write("\nreport\n");
      await commandReport(withResolved);
      process.stdout.write("\nscore\n");
      await commandScore(withResolved);
      break;
    default:
      process.stdout.write(HELP);
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    "\nkrule failed: " +
      (error instanceof Error ? error.message : String(error)) +
      "\n",
  );
  process.exitCode = 1;
});
