"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { AuditView, RuleView } from "../../lib/audits";
import type { Status } from "../../components/landing/sample";
import StatusBadge from "../../components/landing/StatusBadge";
import styles from "../audits.module.css";

const STATUS_ORDER: Status[] = ["verified", "contradicted", "drifted", "unverified"];

type View = "all" | "contradictions" | "dark-logic" | "dead-rule";

const VIEWS: { key: View; label: string; hint: string }[] = [
  { key: "all", label: "All rules", hint: "Every rule in the kontract." },
  {
    key: "contradictions",
    label: "Contradictions",
    hint: "Rules where a cited source states a different value from the code.",
  },
  {
    key: "dark-logic",
    label: "Dark logic",
    hint: "Implemented in code, schema or data, and described in no document.",
  },
  {
    key: "dead-rule",
    label: "Dead rules",
    hint: "Described in documentation, with nothing that implements them.",
  },
];

function matchesView(rule: RuleView, view: View): boolean {
  if (view === "contradictions") return rule.status === "contradicted";
  if (view === "dark-logic") return rule.kind === "dark-logic";
  if (view === "dead-rule") return rule.kind === "dead-rule";
  return true;
}

function matchesQuery(rule: RuleView, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    rule.id.toLowerCase().includes(q) ||
    rule.statement.toLowerCase().includes(q) ||
    rule.sources.some((s) => `${s.file}:${s.line}`.toLowerCase().includes(q))
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AuditWorkspace({ audit }: { audit: AuditView }) {
  const [view, setView] = useState<View>("all");
  const [statuses, setStatuses] = useState<Set<Status>>(new Set());
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const viewCounts = useMemo(
    () =>
      Object.fromEntries(VIEWS.map((v) => [v.key, audit.rules.filter((r) => matchesView(r, v.key)).length])) as Record<
        View,
        number
      >,
    [audit.rules],
  );

  const visible = useMemo(
    () =>
      audit.rules.filter(
        (rule) =>
          matchesView(rule, view) &&
          (statuses.size === 0 || statuses.has(rule.status)) &&
          matchesQuery(rule, query.trim()),
      ),
    [audit.rules, view, statuses, query],
  );

  const openRule = audit.rules.find((r) => r.id === openId) ?? null;

  const open = useCallback((id: string | null) => {
    setOpenId(id);
    const url = id ? `#${id}` : window.location.pathname + window.location.search;
    window.history.replaceState(null, "", url);
  }, []);
  const close = useCallback(() => open(null), [open]);

  // Deep links: /audits/legacy-claims#R-004 opens that rule.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && audit.rules.some((r) => r.id === id)) setOpenId(id);
  }, [audit.rules]);

  const toggleStatus = (status: Status) =>
    setStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  const reset = () => {
    setView("all");
    setStatuses(new Set());
    setQuery("");
  };

  const filtered = view !== "all" || statuses.size > 0 || query.trim() !== "";
  const activeView = VIEWS.find((v) => v.key === view)!;

  return (
    <main className={styles.main}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/audits">Audits</Link>
        <span aria-hidden="true">/</span>
        <span>{audit.module}</span>
      </nav>

      <header className={styles.workspaceHead}>
        <div>
          <h1 className={styles.title}>{audit.title}</h1>
          <dl className={styles.facts}>
            <div>
              <dt>Module</dt>
              <dd>{audit.module}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{audit.sourceLabel}</dd>
            </div>
            <div>
              <dt>Commit</dt>
              <dd>{audit.commit.slice(0, 12)}</dd>
            </div>
            <div>
              <dt>Generated</dt>
              <dd>{formatDate(audit.generatedAt)}</dd>
            </div>
          </dl>
        </div>
        <a href="/sample-report.html" target="_blank" rel="noreferrer" className={styles.buttonGhost}>
          Printable report <span aria-hidden="true">↗</span>
        </a>
      </header>

      {audit.simulatedExtraction && (
        <aside className={styles.notice}>
          <strong>Simulated extraction.</strong> These rules were read from the fixture&apos;s answer key, not
          extracted by a model. Every status and finding below is real: Verify re-read the cited source lines when this
          page was built. Verify checks that the cited lines support the values a rule states; it does not execute the
          code, and it can only flag a contradiction when a rule cites both of the disagreeing sources.
        </aside>
      )}

      <section className={styles.summary} aria-label="Status filter">
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            className={`${styles.statTile} ${styles[status]}`}
            aria-pressed={statuses.has(status)}
            onClick={() => toggleStatus(status)}
          >
            <strong>{audit.counts[status]}</strong>
            <span>{status}</span>
          </button>
        ))}
      </section>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Views">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={view === v.key}
              className={styles.tab}
              onClick={() => setView(v.key)}
            >
              {v.label}
              <span className={styles.tabCount}>{viewCounts[v.key]}</span>
            </button>
          ))}
        </div>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search rules</span>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search by id, wording or file"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <p className={styles.resultLine}>
        <span>{activeView.hint}</span>
        <span>
          {visible.length} of {audit.rules.length} rules
          {filtered && (
            <button type="button" className={styles.linkButton} onClick={reset}>
              Clear filters
            </button>
          )}
        </span>
      </p>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <p>No rules match these filters.</p>
          <button type="button" className={styles.buttonGhost} onClick={reset}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul className={styles.rules}>
          {visible.map((rule) => (
            <li key={rule.id}>
              <button
                type="button"
                className={`${styles.ruleRow} ${styles[rule.status]}`}
                onClick={() => open(rule.id)}
                aria-haspopup="dialog"
              >
                <span className={styles.ruleId}>{rule.id}</span>
                <span className={styles.ruleBody}>
                  <span className={styles.ruleStatement}>{rule.statement}</span>
                  <span className={styles.ruleMeta}>
                    <code>
                      {rule.sources[0]?.file}:{rule.sources[0]?.line}
                    </code>
                    {rule.sources.length > 1 && <span>+{rule.sources.length - 1} more</span>}
                    {rule.kind && <span className={styles.kind}>{rule.kind.replace("-", " ")}</span>}
                  </span>
                </span>
                <span className={styles.ruleStatus}>
                  <StatusBadge status={rule.status} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {openRule && <RuleDrawer rule={openRule} onClose={close} />}
    </main>
  );
}

function RuleDrawer({ rule, onClose }: { rule: RuleView; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className={styles.drawerLayer}>
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
      <aside
        className={`${styles.drawer} ${styles[rule.status]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rule-drawer-title"
      >
        <header className={styles.drawerHead}>
          <span className={styles.ruleId} id="rule-drawer-title">
            {rule.id}
          </span>
          <StatusBadge status={rule.status} />
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className={styles.drawerBody}>
          <p className={styles.drawerStatement}>{rule.statement}</p>

          <section className={styles.finding}>
            <h3>Verify&apos;s finding</h3>
            <p>{rule.reason}</p>
            {rule.conflicting.length > 0 && (
              <ul>
                {rule.conflicting.map((c) => (
                  <li key={`${c.file}:${c.line}`}>
                    <code>
                      {c.file}:{c.line}
                    </code>{" "}
                    states <strong>{c.value}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className={styles.drawerH3}>Sources</h3>
            {rule.sources.map((source) => (
              <figure key={`${source.file}:${source.line}`} className={styles.source}>
                <figcaption>
                  <code>
                    {source.file}:{source.line}
                    {source.endLine && source.endLine !== source.line ? `–${source.endLine}` : ""}
                  </code>
                  <span>@ {source.commit.slice(0, 12)}</span>
                </figcaption>
                {source.excerpt.length > 0 ? (
                  <pre>
                    {source.excerpt.map((line) => (
                      <span key={line.n} className={line.cited ? styles.citedLine : undefined}>
                        <span className={styles.lineNo}>{line.n}</span>
                        {line.text || " "}
                        {"\n"}
                      </span>
                    ))}
                  </pre>
                ) : (
                  <p className={styles.missing}>The cited file could not be read.</p>
                )}
              </figure>
            ))}
          </section>

          <section>
            <h3 className={styles.drawerH3}>Details</h3>
            <dl className={styles.details}>
              <div>
                <dt>Found in</dt>
                <dd>{rule.origins.join(", ")}</dd>
              </div>
              <div>
                <dt>Extraction confidence</dt>
                <dd>{Math.round(rule.confidence * 100)}%</dd>
              </div>
              {rule.kind && (
                <div>
                  <dt>Classification</dt>
                  <dd>{rule.kind === "dark-logic" ? "Dark logic: in no document" : "Dead rule: in no code"}</dd>
                </div>
              )}
              {rule.notes && (
                <div>
                  <dt>Notes</dt>
                  <dd>{rule.notes}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </aside>
    </div>
  );
}
