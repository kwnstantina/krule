'use client';

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState({ hero: false, demo: false });

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === heroRef.current && entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, hero: true }));
        }
        if (entry.target === demoRef.current && entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, demo: true }));
        }
      });
    }, observerOptions);

    if (heroRef.current) observer.observe(heroRef.current);
    if (demoRef.current) observer.observe(demoRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      {/* Animated Background */}
      <div className={styles.backgroundContainer}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
        <div className={styles.gridPattern}></div>
      </div>

      <main className={styles.main}>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className={`${styles.hero} ${isVisible.hero ? styles.visible : ''}`}
        >
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              <span>Rule Engine Platform</span>
            </div>

            <h1 className={styles.heroTitle}>
              Build Powerful Rules
              <br />
              <span className={styles.gradient}>Without Writing Code</span>
            </h1>

            <p className={styles.heroDescription}>
              KRule provides an interactive visual interface to create, test,
              and deploy business rules for any use case. Transform complex logic
              into intuitive workflows.
            </p>

            <div className={styles.ctaGroup}>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryCta}
              >
                <span>Launch Rule Builder</span>
                <svg className={styles.arrow} width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              <a
                href="#demo"
                className={styles.secondaryCta}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                </svg>
                <span>See Demo</span>
              </a>
            </div>

            <div className={styles.statsGroup}>
              <div className={styles.stat}>
                <div className={styles.statValue}>10x</div>
                <div className={styles.statLabel}>Faster Development</div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <div className={styles.statValue}>100%</div>
                <div className={styles.statLabel}>Visual Interface</div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <div className={styles.statValue}>0</div>
                <div className={styles.statLabel}>Code Required</div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Preview Section */}
        <section
          id="demo"
          ref={demoRef}
          className={`${styles.demoSection} ${isVisible.demo ? styles.visible : ''}`}
        >
          <div className={styles.demoContainer}>
            <div className={styles.demoHeader}>
              <h2 className={styles.demoTitle}>Intuitive Rule Builder</h2>
              <p className={styles.demoDescription}>
                Drag, drop, and configure rules with our visual interface
              </p>
            </div>

            <div className={styles.demoPreview}>
              <div className={styles.browserFrame}>
                <div className={styles.browserHeader}>
                  <div className={styles.browserDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className={styles.browserUrl}>localhost:3000</div>
                </div>
                <div className={styles.browserContent}>
                  <div className={styles.mockInterface}>
                    {/* Rule Builder Sidebar */}
                    <div className={styles.mockSidebar}>
                      <div className={styles.sidebarTitle}>Components</div>
                      <div className={styles.mockItem}>
                        <div className={styles.itemIcon}>⚡</div>
                        <div className={styles.itemText}>Conditions</div>
                      </div>
                      <div className={styles.mockItem}>
                        <div className={styles.itemIcon}>✓</div>
                        <div className={styles.itemText}>Actions</div>
                      </div>
                      <div className={styles.mockItem}>
                        <div className={styles.itemIcon}>⚙️</div>
                        <div className={styles.itemText}>Operators</div>
                      </div>
                      <div className={styles.mockItem}>
                        <div className={styles.itemIcon}>📋</div>
                        <div className={styles.itemText}>Templates</div>
                      </div>
                    </div>

                    {/* Rule Builder Canvas */}
                    <div className={styles.mockMain}>
                      {/* Rule Title */}
                      <div className={styles.ruleHeader}>
                        <div className={styles.ruleTitle}>Discount Rule</div>
                        <div className={styles.ruleStatus}>Active</div>
                      </div>

                      {/* IF Condition Block */}
                      <div className={styles.ruleBlock}>
                        <div className={styles.blockHeader}>
                          <div className={styles.blockLabel}>IF</div>
                          <div className={styles.blockTitle}>Condition</div>
                        </div>
                        <div className={styles.blockContent}>
                          <div className={styles.conditionRow}>
                            <span className={styles.conditionField}>order.total</span>
                            <span className={styles.conditionOperator}>&gt;</span>
                            <span className={styles.conditionValue}>$100</span>
                          </div>
                          <div className={styles.logicConnector}>AND</div>
                          <div className={styles.conditionRow}>
                            <span className={styles.conditionField}>customer.type</span>
                            <span className={styles.conditionOperator}>==</span>
                            <span className={styles.conditionValue}>&quot;premium&quot;</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow Connector */}
                      <div className={styles.flowArrow}>↓</div>

                      {/* THEN Action Block */}
                      <div className={styles.ruleBlock}>
                        <div className={styles.blockHeader}>
                          <div className={styles.blockLabel}>THEN</div>
                          <div className={styles.blockTitle}>Actions</div>
                        </div>
                        <div className={styles.blockContent}>
                          <div className={styles.actionRow}>
                            <span className={styles.actionIcon}>💰</span>
                            <span className={styles.actionText}>Apply 15% discount</span>
                          </div>
                          <div className={styles.actionRow}>
                            <span className={styles.actionIcon}>📧</span>
                            <span className={styles.actionText}>Send confirmation email</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.floatingCard}>
                <div className={styles.floatingCardIcon}>✓</div>
                <div className={styles.floatingCardText}>
                  <div className={styles.floatingCardTitle}>Rule Validated</div>
                  <div className={styles.floatingCardSubtitle}>Ready to deploy</div>
                </div>
              </div>
            </div>

            <div className={styles.setupNote}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zM8 4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4z"/>
              </svg>
              <span>Start the web app with: <code>pnpm --filter web dev</code></span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
