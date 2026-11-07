"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_SECTIONS } from "./nav";
import styles from "./docs.module.css";

function NavList() {
  const pathname = usePathname();
  return (
    <>
      {DOC_SECTIONS.map((section) => (
        <div key={section.title} className={styles.navSection}>
          <p className={styles.navTitle}>{section.title}</p>
          <ul>
            {section.pages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className={styles.navLink}
                  aria-current={pathname === page.href ? "page" : undefined}
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export default function DocsNav() {
  const pathname = usePathname();
  const current = DOC_SECTIONS.flatMap((s) => s.pages).find((p) => p.href === pathname);

  return (
    <>
      <nav className={styles.sidebar} aria-label="Documentation">
        <NavList />
      </nav>
      {/* Narrow screens: the same list, folded away above the article. Re-keyed per page so it closes on navigation. */}
      <details key={pathname} className={styles.mobileNav}>
        <summary>
          <span className={styles.navTitle}>Docs</span>
          <span>{current?.title ?? "Contents"}</span>
        </summary>
        <nav aria-label="Documentation">
          <NavList />
        </nav>
      </details>
    </>
  );
}
