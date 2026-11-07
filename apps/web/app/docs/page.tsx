import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DocHeader, PrevNext, Prose } from "./components";
import styles from "./docs.module.css";

export const metadata: Metadata = {
  title: "Documentation — krule",
  description: "How krule recovers, verifies and reports the business rules in a legacy system.",
};

const START = [
  { href: "/docs/quickstart", title: "Quickstart", body: "Run the full pipeline on the bundled example module, no API key needed." },
  { href: "/docs/kontract", title: "The kontract format", body: "The rules file every step reads and writes." },
  { href: "/docs/verification", title: "Verification", body: "How each rule earns its status, and what that does and doesn't prove." },
  { href: "/docs/runtime/engine", title: "Rule engine", body: "Evaluate executable rules in your own code." },
];

export default function DocsHome() {
  return (
    <>
      <DocHeader
        eyebrow="Documentation"
        title="Introduction"
        lede="krule recovers the business rules buried in a legacy system, checks each one against the source it came from, and renders an audit report that cites the line."
      />
      <Prose>
        <p>
          It is built for systems where nobody can say with confidence what the code decides: claims, underwriting,
          payments, the modules that have outlived the people who wrote them. The output is evidence an auditor can
          follow, not a summary to be taken on trust.
        </p>

        <h2>Two parts</h2>
        <p>
          <strong>Observability</strong> is the core of the product. The <code>krule</code> command line reads a
          module&apos;s code, schema, data and documents, writes every rule it finds to a{" "}
          <Link href="/docs/kontract">kontract</Link>, verifies each rule against its cited source, and renders an
          audit report.
        </p>
        <p>
          <strong>Runtime</strong> is a small, typed rule engine with a visual builder. It evaluates executable rules
          (conditions and actions) against a JSON context. Today the two parts are separate; linking a recovered rule
          to an executable one is planned.
        </p>

        <h2>The pipeline</h2>
        <ol>
          <li>
            <strong>Discover</strong> extracts rules into <code>rules.kontract.yaml</code>. Every rule needs a file,
            a line and a commit, or it is not recorded.
          </li>
          <li>
            <strong>Verify</strong> re-reads each cited line and assigns a status: verified, unverified, contradicted
            or drifted.
          </li>
          <li>
            <strong>Report</strong> renders a self-contained <code>audit-report.html</code> with four sections: rule
            inventory, contradictions, dark logic and dead rules.
          </li>
        </ol>

        <Callout tone="roadmap">
          <p>
            Executable per-rule tests, drift checks on pull requests, and migrating a rule family onto the Runtime
            engine are planned and not built yet. These docs describe what exists today and say so where a feature is
            still to come.
          </p>
        </Callout>

        <h2>Where to start</h2>
        <div className={styles.cards}>
          {START.map((item) => (
            <Link key={item.href} href={item.href} className={styles.card}>
              <span>{item.title}</span>
              <p>{item.body}</p>
            </Link>
          ))}
        </div>
      </Prose>
      <PrevNext href="/docs" />
    </>
  );
}
