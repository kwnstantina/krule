import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Callout, Code, DocHeader, PrevNext, Prose } from "../components";

export const metadata: Metadata = {
  title: "Quickstart — krule docs",
};

export default function QuickstartPage() {
  return (
    <>
      <DocHeader
        eyebrow="Start here"
        title="Quickstart"
        lede="Run discover, verify and report on the bundled example module in a couple of minutes, without an API key."
      />
      <Prose>
        <h2>Requirements</h2>
        <ul>
          <li>Node.js 18 or later</li>
          <li>pnpm 9 (or run it through <code>npx pnpm@9</code>)</li>
          <li>A clone of the krule repository</li>
        </ul>

        <h2>1. Install</h2>
        <Code title="repository root">{`pnpm install`}</Code>

        <h2>2. Run the demo</h2>
        <p>
          The repository ships an example module, <code>fixtures/legacy-claims</code>: a claims-authorisation service
          with rules spread across TypeScript, a SQL schema, seed data and two internal wikis. Some of those rules
          disagree with each other on purpose.
        </p>
        <Code title="repository root">{`pnpm --filter krule start demo "$PWD/fixtures/legacy-claims" --out "$PWD/out"`}</Code>
        <p>
          Pass absolute paths: the command runs from the CLI&apos;s own folder, so a relative path would resolve
          there instead of the repository root.
        </p>

        <Callout tone="note">
          <p>
            <code>demo</code> simulates the extraction step by reading the module&apos;s answer key instead of calling
            a model. Everything after that is real: Verify re-reads the source files and the report renders the
            result. Use <Link href="/docs/cli">krule discover</Link> with an API key for genuine extraction.
          </p>
        </Callout>

        <h2>3. Read the output</h2>
        <p>The verify step prints a status count and every finding:</p>
        <Code title="output (excerpt)">{`verify   (real — re-reads the fixture source)
  verified      15  ████████████░░░░░░░░░░░░
  contradicted   1  █░░░░░░░░░░░░░░░░░░░░░░░
  drifted        0  ░░░░░░░░░░░░░░░░░░░░░░░░
  unverified    14  ███████████░░░░░░░░░░░░░

  findings
    R-004  CONTRADICTED  code applies 45 but docs/underwriting-wiki.md states 30`}</Code>
        <p>Two files land in the output folder:</p>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>What it is</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>rules.kontract.yaml</code>
              </td>
              <td>
                Every rule with its provenance and its status after verification. See{" "}
                <Link href="/docs/kontract">the kontract format</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>audit-report.html</code>
              </td>
              <td>
                A single self-contained page you can open, print or send. See{" "}
                <Link href="/docs/audit-report">the audit report</Link>.
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          The same result is browsable in this site as the{" "}
          <Link href="/audits/legacy-claims">sample audit</Link>, with each rule&apos;s cited source lines shown
          inline.
        </p>

        <Callout tone="caution">
          <p>
            Demo mode also prints a score of 100%. That figure is circular, because the input to scoring is the
            answer key itself. Scores are only meaningful after a real <code>krule discover</code> run.
          </p>
        </Callout>

        <h2>4. Run it for real</h2>
        <p>
          Set <code>ANTHROPIC_API_KEY</code> and use <code>audit</code>, which runs discover, verify, report and score
          in one pass:
        </p>
        <Code title="repository root">{`export ANTHROPIC_API_KEY=...
pnpm --filter krule start audit "$PWD/fixtures/legacy-claims" --out "$PWD/out"`}</Code>
        <p>
          Without a key, krule replays a recorded model response where one exists and never touches the network.
        </p>
      </Prose>
      <PrevNext href="/docs/quickstart" />
    </>
  );
}
