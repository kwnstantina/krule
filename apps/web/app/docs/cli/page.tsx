import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Callout, Code, DocHeader, PrevNext, Prose } from "../components";

export const metadata: Metadata = {
  title: "CLI reference — krule docs",
};

const COMMANDS: [string, React.ReactNode][] = [
  ["discover <module>", <>Extract business rules into <code>rules.kontract.yaml</code>.</>],
  ["verify <module>", "Check each rule against its cited source and write the statuses back into the kontract."],
  ["report <module>", <>Render <code>audit-report.html</code> from the kontract.</>],
  ["score <module>", "Score the kontract against the module's answer key: precision, recall, and recall per classification."],
  ["audit <module>", "discover, verify, report and score in one pass."],
  ["demo <module>", "The same pipeline with extraction simulated from the answer key, for running without an API key."],
  [
    "observe [log.csv]",
    <>
      Check an event log against policy documents and look for unwritten rules. The model proposes hypotheses; every
      figure comes from a local query over the log. Writes <code>observations.json</code> and{" "}
      <code>log-profile.md</code>. With no log, uses the <code>legacy-claims-ops</code> example.
    </>,
  ],
];

const ENV: [string, string, string][] = [
  ["ANTHROPIC_API_KEY", "unset", "Enables live extraction. Without it, krule replays a recorded response and never touches the network."],
  ["KRULE_LLM", "auto", "anthropic, recorded or auto."],
  ["KRULE_EFFORT", "high", "low, medium, high, xhigh or max."],
  ["KRULE_CACHE_DIR", ".krule-cache", "Where recorded responses live."],
  ["KRULE_JUDGE", "auto", "claude, deterministic or auto. Auto uses Claude when ANTHROPIC_API_KEY is set."],
  ["KRULE_MODEL", "claude-opus-5-5", "Extraction model."],
  ["KRULE_JUDGE_MODEL", "claude-sonnet-5-5", "Scoring judge model."],
];

export default function CliPage() {
  return (
    <>
      <DocHeader
        eyebrow="Observability"
        title="CLI reference"
        lede="Most krule commands take the path to one module: the folder holding the code, schema, data and documents to read."
      />
      <Prose>
        <Code title="usage">{`krule <command> <module> [--out <dir>]
krule observe [log.csv] [--policy <file>]... [--reference]`}</Code>
        <p>
          Inside the repository the CLI runs through pnpm as{" "}
          <code>pnpm --filter krule start &lt;command&gt; &lt;module&gt;</code>. See the{" "}
          <Link href="/docs/quickstart">quickstart</Link> for why the module path should be absolute.
        </p>

        <h2>Commands</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            {COMMANDS.map(([command, body]) => (
              <tr key={command}>
                <td>
                  <code>{command}</code>
                </td>
                <td>{body}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Options</h2>
        <table>
          <thead>
            <tr>
              <th>Option</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--out &lt;dir&gt;</code>, <code>-o</code>
              </td>
              <td>Where to write artifacts. Defaults to the current directory, and is created if it does not exist.</td>
            </tr>
            <tr>
              <td>
                <code>--policy &lt;file&gt;</code>
              </td>
              <td>observe only: a policy document to check the log against. Repeat it for several documents.</td>
            </tr>
            <tr>
              <td>
                <code>--reference</code>
              </td>
              <td>
                observe only: use the example&apos;s hand-written hypotheses instead of the model. Offline, and circular
                in the same way as <code>demo</code>.
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Environment</h2>
        <table>
          <thead>
            <tr>
              <th>Variable</th>
              <th>Default</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {ENV.map(([name, fallback, meaning]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>
                  <code>{fallback}</code>
                </td>
                <td>{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Scoring</h2>
        <p>
          <code>score</code> needs an answer key, so it only applies to benchmark modules like{" "}
          <code>fixtures/legacy-claims</code> that ship one. It reports precision, recall and recall per
          classification (normal, dark logic, dead rule, contradiction) against an 80% threshold.
        </p>
        <Callout tone="caution">
          <p>
            Without <code>ANTHROPIC_API_KEY</code>, scoring uses an offline judge based on term overlap. It
            under-credits paraphrase, so treat its figure as a lower bound.
          </p>
        </Callout>
      </Prose>
      <PrevNext href="/docs/cli" />
    </>
  );
}
