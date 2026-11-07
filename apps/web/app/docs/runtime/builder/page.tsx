import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Callout, Code, DocHeader, PrevNext, Prose } from "../../components";

export const metadata: Metadata = {
  title: "Rule builder — krule docs",
};

export default function BuilderDocsPage() {
  return (
    <>
      <DocHeader
        eyebrow="Runtime"
        title="Rule builder"
        lede={
          <>
            The <Link href="/builder">rule builder</Link> is a visual front end to the{" "}
            <Link href="/docs/runtime/engine">rule engine</Link>: write rules, run them against sample data, and export
            them as code.
          </>
        }
      />
      <Prose>
        <p>
          Rules live in the page while you work. Export them before leaving, since nothing is saved between visits.
          Each tab has its own address, so you can link straight to one.
        </p>

        <h2>Build</h2>
        <p>
          Give the rule a name and a priority, then add conditions and actions. Start from one of the templates to see
          a complete rule. Conditions in the form are combined with <code>AND</code>; values that look like numbers or
          booleans are stored as numbers or booleans.
        </p>

        <h2>Test</h2>
        <p>
          Paste a JSON context, or pick a scenario, and run the rules. The result lists every target an action applied
          to. See the note on <Link href="/docs/runtime/engine">priorities</Link> when two rules write the same target.
        </p>

        <h2>Export</h2>
        <p>
          Copy or download the rules as JSON (data), TypeScript or JavaScript. The code exports include a small{" "}
          <code>evaluateRules(context)</code> wrapper around <code>executeRules</code>.
        </p>

        <h2>AI assistant</h2>
        <p>
          Describe a rule in plain language and the assistant drafts it. Drafts are validated against the rule schema,
          and invalid output is sent back with the errors for another attempt, up to three times. Review each draft,
          then add it to your rules, refine it, or ask for an explanation.
        </p>
        <Callout tone="note">
          <p>
            The assistant runs on Groq and stores conversations in Postgres, so the server needs both variables set in{" "}
            <code>apps/web/.env.local</code> (and the root <code>.env</code> for Prisma):
          </p>
          <Code title=".env.local">{`GROQ_API_KEY=gsk_...
DATABASE_URL=postgresql://postgres:password@localhost:5432/krule`}</Code>
        </Callout>
        <p>
          The build, test and export tabs work without either.
        </p>
      </Prose>
      <PrevNext href="/docs/runtime/builder" />
    </>
  );
}
