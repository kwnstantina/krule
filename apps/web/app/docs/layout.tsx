import React from "react";
import DocsNav from "./DocsNav";
import styles from "./docs.module.css";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <DocsNav />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
