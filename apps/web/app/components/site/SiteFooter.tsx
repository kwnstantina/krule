import React from "react";
import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <span className={styles.brand}>krule</span>
          <p>Business logic observability for regulated systems.</p>
        </div>
        <nav className={styles.cols} aria-label="Footer">
          <div>
            <h4>Product</h4>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/audits/legacy-claims">Sample audit</Link>
            <Link href="/builder">Rule builder</Link>
          </div>
          <div>
            <h4>Resources</h4>
            <Link href="/docs">Documentation</Link>
            <Link href="/#contact">Book an audit</Link>
          </div>
        </nav>
      </div>
      <div className={styles.base}>
        <span>© {new Date().getFullYear()} krule</span>
        <span className={styles.mono}>kontract v1</span>
      </div>
    </footer>
  );
}
