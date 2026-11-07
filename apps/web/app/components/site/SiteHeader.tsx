import React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="krule home">
          <span className={styles.mark} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          krule
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/audits/legacy-claims">Sample audit</Link>
          <Link href="/builder">Rule builder</Link>
          <Link href="/docs">Docs</Link>
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <Link href="/#contact" className={styles.cta}>
            Book an audit
          </Link>
        </div>
      </div>
    </header>
  );
}
