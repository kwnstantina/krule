import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DocHeader, PrevNext, Prose } from "../components";

export const metadata: Metadata = {
  title: "The audit report — krule docs",
};

export default function AuditReportPage() {
  return (
    <>
      <DocHeader
        eyebrow="Observability"
        title="The audit report"
        lede={
          <>
            <code>krule report</code> renders the kontract as <code>audit-report.html</code>: one self-contained file
            with no external assets, made to be opened, printed or attached to an email.
          </>
        }
      />
      <Prose>
        <p>
          Open the <a href="/sample-report.html" target="_blank" rel="noreferrer">sample report</a> to see one rendered
          from the bundled example module, or browse the same rules interactively in the{" "}
          <Link href="/audits/legacy-claims">sample audit</Link>.
        </p>

        <h2>Status summary</h2>
        <p>
          The report opens with a count of rules in each status. When the report is rendered straight after a verify
          run, that run&apos;s verdicts take precedence over the statuses stored in the file.
        </p>

        <h2>The four sections</h2>
        <h3>I. Rule inventory</h3>
        <p>
          Every rule recovered from the module, ordered by extraction confidence. Each carries the file and line it
          was found at, so any statement can be checked against the source.
        </p>
        <h3>II. Contradiction report</h3>
        <p>
          Rules where two sources disagree, with the value the code applies and the value the other source states.
          These are the highest-priority findings: documentation that confidently states the wrong threshold is worse
          than none.
        </p>
        <h3>III. Dark logic</h3>
        <p>
          Rules the system enforces that no document mentions. A rule is dark logic when its origins include code,
          schema or data, and not documents.
        </p>
        <h3>IV. Dead rules</h3>
        <p>
          Rules the documentation describes that nothing implements: the behaviour was removed and the document
          wasn&apos;t, or it was never built. A rule is listed here when documents are its only origin.
        </p>

        <Callout tone="caution">
          <p>
            Dark logic and dead rules are derived from where a rule was found, not from running the code. A rule
            implemented in a branch that can never execute still counts as implemented here.
          </p>
        </Callout>

        <h2>Reading a rule entry</h2>
        <ul>
          <li><strong>Identifier and status</strong>, e.g. R-004 contradicted.</li>
          <li><strong>Statement</strong> in plain language.</li>
          <li><strong>Citations</strong>: every file and line the rule was found at.</li>
          <li><strong>Confidence and origins</strong>: how sure extraction was, and which kinds of source evidence it.</li>
          <li><strong>Reason</strong>: Verify&apos;s one-line explanation of the status, plus any reviewer notes.</li>
        </ul>

        <Callout tone="roadmap">
          <p>
            A report pack formatted for DORA submissions, and drift checks that flag a pull request when it changes a
            recorded rule, are planned.
          </p>
        </Callout>
      </Prose>
      <PrevNext href="/docs/audit-report" />
    </>
  );
}
