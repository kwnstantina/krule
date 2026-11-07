import React from "react";
import type { Status } from "./sample";
import styles from "./landing.module.css";

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{status}</span>;
}
