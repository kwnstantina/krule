import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { listAudits } from "../lib/audits";
import type { Status } from "../components/landing/sample";
import styles from "./audits.module.css";

export const metadata: Metadata = {
  title: "Audits — krule",
};

const STATUS_ORDER: Status[] = ["verified", "contradicted", "drifted", "unverified"];

export default async function AuditsPage() {
  const audits = await listAudits();

  return (
    <main className={styles.main}>
      <header className={styles.pageHead}>
        <p className={styles.eyebrow}>Audits</p>
        <h1 className={styles.title}>Rule inventories</h1>
        <p className={styles.lede}>
          Each audit is a kontract produced by the krule CLI, re-verified against the module source when this page is
          built.
        </p>
      </header>

      <ul className={styles.auditList}>
        {audits.map((audit) => (
          <li key={audit.module}>
            <Link href={`/audits/${audit.module}`} className={styles.auditCard}>
              <div>
                <span className={styles.mono}>{audit.module}</span>
                <h2>{audit.title}</h2>
                <p>{audit.summary}</p>
              </div>
              <div className={styles.auditCounts}>
                {STATUS_ORDER.map((status) => (
                  <span key={status} className={styles[status]}>
                    <strong>{audit.counts[status]}</strong> {status}
                  </span>
                ))}
                <span className={styles.auditOpen}>
                  Open {audit.ruleCount} rules <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
