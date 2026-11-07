"use client";

import React, { useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";

type Theme = "light" | "dark";

const STORAGE_KEY = "krule-theme";

function currentTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  // Unknown until mounted: the server cannot know the visitor's theme.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const toggle = () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the choice still applies for this page view.
    }
    setTheme(next);
  };

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button type="button" className={styles.themeToggle} onClick={toggle} aria-label={label} title={label}>
      {/* Both icons render; CSS shows the one matching the active theme. */}
      <svg className={styles.iconSun} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg className={styles.iconMoon} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
