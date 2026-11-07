import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Callout, Code, DocHeader, PrevNext, Prose } from "../components";

export const metadata: Metadata = {
  title: "The kontract format — krule docs",
};

const RULE_FIELDS: [string, string, React.ReactNode][] = [
  ["id", "string", <>Matches <code>R-</code> followed by digits, e.g. <code>R-114</code>. Unique within the file.</>],
  ["statement", "string", "The rule in plain language. A readable sentence of at least 10 characters, not a fragment."],
  ["provenance", "list, at least one", <>Where the rule was found: <code>file</code>, <code>line</code>, an optional <code>endLine</code>, and the <code>commit</code> it was read at.</>],
  ["confidence", "number, 0 to 1", "How sure extraction was that this is a real rule."],
  ["origins", "list, at least one", <>Which kinds of source evidence it: <code>code</code>, <code>schema</code>, <code>data</code>, <code>docs</code>.</>],
  ["status", "enum", <><code>verified</code>, <code>unverified</code>, <code>contradicted</code> or <code>drifted</code>. Defaults to <code>unverified</code>.</>],
  ["tags", "list, optional", "Free-form labels."],
  ["notes", "string, optional", "Reviewer notes."],
];

export default function KontractPage() {
  return (
    <>
      <DocHeader
        eyebrow="Observability"
        title="The kontract format"
        lede={
          <>
            <code>rules.kontract.yaml</code> is the one artifact every step shares. Discover writes it, Verify
            annotates it, the report renders it.
          </>
        }
      />
      <Prose>
        <p>
          A kontract is a plain YAML file meant to be committed next to the code it describes and reviewed like any
          other change. Each entry is a business rule in plain language with the evidence for it.
        </p>

        <h2>Example</h2>
        <Code title="rules.kontract.yaml">{`kontractVersion: 1
module: legacy-claims
generatedAt: 2026-11-07T19:29:08.203Z
commit: e73742adf0f5f92803e71cabd198f0de12e08cd4
rules:
  - id: R-004
    statement: A claim is rejected if the policy lapsed more than 45 days
      before the incident date.
    provenance:
      - file: src/authorise-claim.ts
        line: 62
        commit: e73742adf0f5f92803e71cabd198f0de12e08cd4
      - file: docs/underwriting-wiki.md
        line: 14
        commit: e73742adf0f5f92803e71cabd198f0de12e08cd4
    confidence: 1
    origins:
      - code
      - docs
    status: contradicted`}</Code>

        <h2>Document fields</h2>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>kontractVersion</code></td>
              <td>Always <code>1</code> for this version of the format, so later changes are detectable.</td>
            </tr>
            <tr>
              <td><code>module</code></td>
              <td>Name of the module the rules were extracted from.</td>
            </tr>
            <tr>
              <td><code>generatedAt</code></td>
              <td>ISO 8601 timestamp of extraction.</td>
            </tr>
            <tr>
              <td><code>commit</code></td>
              <td>Commit of the target repository at extraction time.</td>
            </tr>
            <tr>
              <td><code>rules</code></td>
              <td>The list of rules. Duplicate ids are rejected.</td>
            </tr>
          </tbody>
        </table>

        <h2>Rule fields</h2>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {RULE_FIELDS.map(([name, type, meaning]) => (
              <tr key={name}>
                <td><code>{name}</code></td>
                <td>{type}</td>
                <td>{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Why these constraints</h2>
        <ul>
          <li>
            <strong>Provenance is required.</strong> A rule that can&apos;t be traced to a file, a line and a commit
            isn&apos;t reported. The commit makes it possible to tell later whether the code has moved on.
          </li>
          <li>
            <strong>Status starts as unverified.</strong> Nothing is trusted on the extractor&apos;s word. Only{" "}
            <Link href="/docs/verification">verification</Link> changes it.
          </li>
          <li>
            <strong>Origins drive the report.</strong> A rule found only in code, schema or data is dark logic; a rule
            found only in documents is a dead-rule candidate. See <Link href="/docs/audit-report">the audit report</Link>.
          </li>
        </ul>

        <h2>Reading and writing it in code</h2>
        <p>
          Inside the monorepo, <code>@repo/kontract</code> validates and serialises the format:
        </p>
        <Code title="TypeScript">{`import { readKontractFile, updateRuleStatuses } from "@repo/kontract";

const doc = await readKontractFile("rules.kontract.yaml");  // throws on invalid input
const updated = updateRuleStatuses(yamlText, { "R-004": "contradicted" });`}</Code>
        <Callout tone="note">
          <p>
            Use <code>updateRuleStatuses</code> to change statuses. It edits the YAML in place, so reviewers&apos;
            comments in the file survive. Parsing and re-serialising the whole document would drop them.
          </p>
        </Callout>
      </Prose>
      <PrevNext href="/docs/kontract" />
    </>
  );
}
