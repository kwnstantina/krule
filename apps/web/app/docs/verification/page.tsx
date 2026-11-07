import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "../../components/landing/StatusBadge";
import { Callout, DocHeader, PrevNext, Prose } from "../components";

export const metadata: Metadata = {
  title: "Verification and statuses — krule docs",
};

export default function VerificationPage() {
  return (
    <>
      <DocHeader
        eyebrow="Observability"
        title="Verification and statuses"
        lede="Verify re-reads every source a rule cites and checks that the values the rule states are really there. The outcome is one of four statuses."
      />
      <Prose>
        <h2>The four statuses</h2>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>When a rule gets it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><StatusBadge status="verified" /></td>
              <td>Every value the statement asserts was found at a cited line.</td>
            </tr>
            <tr>
              <td><StatusBadge status="contradicted" /></td>
              <td>
                The code supports the statement, and another source the same rule cites, in a different file, states
                a different value. This is how documentation that disagrees with the code surfaces.
              </td>
            </tr>
            <tr>
              <td><StatusBadge status="drifted" /></td>
              <td>
                A cited file no longer exists, or the asserted value is in the file but no longer at the cited line.
                The rule was true once; the citation no longer lands on it.
              </td>
            </tr>
            <tr>
              <td><StatusBadge status="unverified" /></td>
              <td>
                There is nothing checkable: a qualitative rule with no numeric claim, or a value that appears
                nowhere in the cited source.
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          Every verdict comes with a one-line reason that names the value and the location, for example{" "}
          <code>code applies 45 but docs/underwriting-wiki.md states 30</code>. The reasons appear in the CLI output,
          the report and the <Link href="/audits/legacy-claims">sample audit</Link>.
        </p>

        <h2>How a rule is checked</h2>
        <ol>
          <li>The numbers in the rule&apos;s statement are extracted, e.g. 45 in &ldquo;more than 45 days&rdquo;.</li>
          <li>For each citation, Verify reads a window of two lines either side of the cited line (or range).</li>
          <li>Asserted values found in those windows count as supported.</li>
          <li>
            Values in a cited window from a <em>different file</em> that the statement doesn&apos;t assert are
            conflicts. Numbers on neighbouring lines of the same file are ignored, since they are usually unrelated.
          </li>
          <li>A missing file means drifted. A conflict means contradicted. Otherwise the status follows from what was supported.</li>
        </ol>

        <h2>What a status does and doesn&apos;t prove</h2>
        <Callout tone="caution">
          <p>
            <strong>Verified means the citation supports the statement.</strong> It does not mean the code path runs.
            A rule can be verified and still sit in a branch that never executes. That case is caught from the
            rule&apos;s origins in the report, not by this check.
          </p>
          <p>
            <strong>Contradictions are found only where a rule cites both sources.</strong> If extraction records the
            code and the wiki as two separate rules, the disagreement isn&apos;t flagged. On the bundled example, one
            of the four planted contradictions is caught today.
          </p>
          <p>
            <strong>Qualitative rules stay unverified.</strong> A rule with no number in it has nothing to compare and
            needs an executable test.
          </p>
        </Callout>

        <Callout tone="roadmap">
          <p>
            Generating an executable test for each rule and running it against the real code is planned. That is what
            will move qualitative rules out of unverified and prove reachability.
          </p>
        </Callout>
      </Prose>
      <PrevNext href="/docs/verification" />
    </>
  );
}
