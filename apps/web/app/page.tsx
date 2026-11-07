import React from "react";
import Link from "next/link";
import StatusBadge from "./components/landing/StatusBadge";
import { SAMPLE_COUNTS, SAMPLE_MODULE, SAMPLE_RULES, type Status } from "./components/landing/sample";
import styles from "./components/landing/landing.module.css";
import { CONTACT_EMAIL, CONTACT_HREF } from "./lib/site";

const STATUS_ORDER: Status[] = ["verified", "contradicted", "drifted", "unverified"];

const STATUS_MEANING: Record<Status, string> = {
  verified: "The rule's claim matches the source line it cites.",
  contradicted: "Two sources disagree: the code does one thing, the documentation says another.",
  drifted: "The rule held at the baseline, and a later change altered it.",
  unverified: "Recovered and cited, but not yet proven by an executable test.",
};

const PROBLEMS = [
  {
    label: "Dark logic",
    title: "Rules that live only in code",
    body: "Thresholds and exceptions added under deadline, never written down. Nobody can list them, so nobody can sign them off.",
  },
  {
    label: "Dead rules",
    title: "Policies the system no longer enforces",
    body: "The wiki still describes them and the auditors still read them. The code path that applied them was removed years ago.",
  },
  {
    label: "Contradictions",
    title: "Code and documents that disagree",
    body: "The underwriting guide says 30 days. The code applies 45. Which one did your customers actually get?",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Reads a module's code, schema, data and documents, and writes every business rule it finds to a kontract: a plain-language statement with the file, line and commit it came from.",
    meta: "krule discover",
  },
  {
    n: "02",
    title: "Verify",
    body: "Re-reads each cited source and assigns a status. A rule whose numbers disagree with the documentation is flagged, never silently picked.",
    meta: "krule verify",
  },
  {
    n: "03",
    title: "Report",
    body: "Produces a self-contained audit report: rule inventory, contradictions, dark logic and dead rules. It prints cleanly and every claim links to its source.",
    meta: "krule report",
  },
  {
    n: "04",
    title: "Guard",
    body: "Compares each pull request against the baseline kontract and flags any change to a rule before it ships.",
    meta: "On the roadmap",
    roadmap: true,
  },
];

const PRINCIPLES = [
  {
    title: "Read-only by design",
    body: "Extraction never writes to the systems it reads. It runs inside your perimeter, and only the report leaves.",
  },
  {
    title: "Every rule is cited",
    body: "No rule enters the inventory without a file, a line and a commit. If it can't be traced, it isn't reported.",
  },
  {
    title: "Honest about uncertainty",
    body: "Unproven rules are marked unverified, not rounded up. The report shows what is known and what still needs a test.",
  },
  {
    title: "Documentation that stays current",
    body: "Built for regimes like DORA and Solvency II that expect system documentation to be current and provable, not a binder from the last migration.",
  },
];

export default function Home() {
  const total = Object.values(SAMPLE_COUNTS).reduce((a, b) => a + b, 0);

  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Business logic observability</p>
          <h1 className={styles.headline}>
            Know what your legacy code <em>actually</em> decides.
          </h1>
          <p className={styles.lede}>
            krule recovers the business rules buried in legacy systems, checks each one against the line it came
            from, and gives your auditors evidence instead of folklore.
          </p>
          <div className={styles.heroActions}>
            <Link href="#contact" className={styles.buttonPrimary}>
              Book an audit
            </Link>
            <Link href="/audits/legacy-claims" className={styles.buttonGhost}>
              Explore a sample audit <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className={styles.heroNote}>For insurers, banks and the teams that maintain their core systems.</p>
        </div>

        <figure className={styles.panel} aria-label="Sample audit summary">
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Rule audit</span>
            <span className={styles.panelMeta}>
              {SAMPLE_MODULE} · {total} rules
            </span>
          </div>
          <div className={styles.tiles}>
            {STATUS_ORDER.map((status) => (
              <div key={status} className={`${styles.tile} ${styles[status]}`}>
                <strong>{SAMPLE_COUNTS[status]}</strong>
                <span>{status}</span>
              </div>
            ))}
          </div>
          <ul className={styles.ruleList}>
            {SAMPLE_RULES.slice(0, 3).map((rule) => (
              <li key={rule.id} className={`${styles.ruleRow} ${styles[rule.status]}`}>
                <span className={styles.ruleId}>{rule.id}</span>
                <div>
                  <p className={styles.ruleStatement}>{rule.statement}</p>
                  <div className={styles.ruleMeta}>
                    <StatusBadge status={rule.status} />
                    <code>{rule.citations[0]}</code>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <figcaption className={styles.panelCaption}>
            Real output from the bundled legacy-claims fixture.
          </figcaption>
        </figure>
      </section>

      {/* Problem */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>The problem</p>
          <h2 className={styles.h2}>Nobody can say what the system really does.</h2>
          <p className={styles.sectionLede}>
            In fifteen-year-old systems, the rules that decide who gets paid are scattered across code, database
            conventions and wikis that stopped being true long ago. Today that gap is closed by long, expensive
            consulting engagements, and the answer is out of date the day it&apos;s delivered.
          </p>
        </div>
        <div className={styles.problemGrid}>
          {PROBLEMS.map((p) => (
            <article key={p.label} className={styles.problemCard}>
              <span className={styles.problemLabel}>{p.label}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>How it works</p>
          <h2 className={styles.h2}>From source code to signed-off rules.</h2>
        </div>
        <ol className={styles.steps}>
          {STEPS.map((s) => (
            <li key={s.n} className={styles.step}>
              <span className={styles.stepNumber}>{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className={s.roadmap ? styles.stepRoadmap : styles.stepMeta}>{s.meta}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Evidence */}
      <section id="evidence" className={`${styles.section} ${styles.evidence}`}>
        <div className={styles.evidenceCopy}>
          <p className={styles.eyebrow}>The evidence</p>
          <h2 className={styles.h2}>Four statuses. No rule without a source.</h2>
          <dl className={styles.statusList}>
            {STATUS_ORDER.map((status) => (
              <div key={status}>
                <dt>
                  <StatusBadge status={status} />
                </dt>
                <dd>{STATUS_MEANING[status]}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.heroActions}>
            <Link href="/audits/legacy-claims" className={styles.buttonPrimary}>
              Explore the sample audit <span aria-hidden="true">→</span>
            </Link>
            <a href="/sample-report.html" className={styles.buttonGhost} target="_blank" rel="noreferrer">
              Printable report <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className={styles.evidenceCards}>
          {SAMPLE_RULES.map((rule) => (
            <Link
              key={rule.id}
              href={`/audits/legacy-claims#${rule.id}`}
              className={`${styles.evidenceCard} ${styles[rule.status]}`}
            >
              <header>
                <span className={styles.ruleId}>{rule.id}</span>
                <StatusBadge status={rule.status} />
              </header>
              <p className={styles.evidenceStatement}>{rule.statement}</p>
              <div className={styles.citations}>
                {rule.citations.map((c) => (
                  <code key={c}>{c}</code>
                ))}
              </div>
              {rule.finding && <p className={styles.finding}>{rule.finding}</p>}
              {rule.tag && <p className={styles.finding}>{rule.tag}</p>}
            </Link>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Built for regulated teams</p>
          <h2 className={styles.h2}>Trust you can hand to an auditor.</h2>
        </div>
        <div className={styles.principles}>
          {PRINCIPLES.map((p) => (
            <article key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className={styles.contact}>
        <div>
          <h2 className={styles.h2}>See what one of your modules really decides.</h2>
          <p className={styles.sectionLede}>
            We run krule against a single module of your choosing, inside your environment, and walk you through the
            report: every rule, every contradiction, every line it came from.
          </p>
        </div>
        <div className={styles.contactActions}>
          <a href={CONTACT_HREF} className={styles.buttonPrimary}>
            Book an audit
          </a>
          <p className={styles.contactEmail}>
            or write to <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a>
          </p>
          <Link href="/builder" className={styles.buttonGhost}>
            Explore the rule builder <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
