import React from "react";
import Link from "next/link";
import { neighbours } from "./nav";
import styles from "./docs.module.css";

export function DocHeader({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: React.ReactNode }) {
  return (
    <header className={styles.header}>
      <p className="k-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className={styles.lede}>{lede}</p>
    </header>
  );
}

/** Long-form body: element styles for headings, lists, tables and inline code. */
export function Prose({ children }: { children: React.ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}

export function Code({ title, children }: { title?: string; children: string }) {
  return (
    <figure className={styles.code}>
      {title && <figcaption>{title}</figcaption>}
      <pre>{children}</pre>
    </figure>
  );
}

type CalloutTone = "note" | "caution" | "roadmap";

const CALLOUT_LABEL: Record<CalloutTone, string> = {
  note: "Note",
  caution: "Limitation",
  roadmap: "On the roadmap",
};

export function Callout({ tone = "note", children }: { tone?: CalloutTone; children: React.ReactNode }) {
  return (
    <aside className={`${styles.callout} ${styles[tone]}`}>
      <strong>{CALLOUT_LABEL[tone]}</strong>
      <div>{children}</div>
    </aside>
  );
}

export function PrevNext({ href }: { href: string }) {
  const { prev, next } = neighbours(href);
  return (
    <nav className={styles.prevNext} aria-label="Pagination">
      {prev ? (
        <Link href={prev.href}>
          <span>Previous</span>
          {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.href} className={styles.nextLink}>
          <span>Next</span>
          {next.title}
        </Link>
      )}
    </nav>
  );
}
