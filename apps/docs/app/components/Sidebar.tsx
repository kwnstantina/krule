'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import styles from './Sidebar.module.css';

interface SidebarItem {
  title: string;
  href?: string;
  children?: SidebarItem[];
  icon?: React.ReactNode;
}

const navigationItems: SidebarItem[] = [
  {
    title: 'Getting Started',
    children: [
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Quick Start', href: '/docs/quickstart' },
      { title: 'Configuration', href: '/docs/configuration' },
    ],
  },
  {
    title: 'Core Concepts',
    children: [
      { title: 'What is KRule?', href: '/docs/what-is-krule' },
      { title: 'Rule Engine Basics', href: '/docs/rule-engine-basics' },
      { title: 'Rule Builder Interface', href: '/docs/rule-builder' },
      { title: 'Rule Testing', href: '/docs/rule-testing' },
    ],
  },
  {
    title: 'Examples',
    children: [
      { title: 'E-commerce Rules', href: '/docs/examples/ecommerce' },
      { title: 'User Validation', href: '/docs/examples/validation' },
      { title: 'Content Filtering', href: '/docs/examples/filtering' },
      { title: 'Workflow Automation', href: '/docs/examples/workflow' },
    ],
  },
  {
    title: 'API Reference',
    children: [
      { title: 'Rule Builder API', href: '/docs/api/rule-builder' },
      { title: 'Rule Executor', href: '/docs/api/rule-executor' },
      { title: 'Export Formats', href: '/docs/api/export-formats' },
    ],
  },
  {
    title: 'Advanced',
    children: [
      { title: 'Custom Functions', href: '/docs/advanced/custom-functions' },
      { title: 'Performance Optimization', href: '/docs/advanced/performance' },
      { title: 'Integration Patterns', href: '/docs/advanced/integration' },
    ],
  },
];

interface SidebarItemProps {
  item: SidebarItem;
  level?: number;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={styles.sidebarItem}>
      {item.href ? (
        <Link href={item.href} className={`${styles.sidebarLink} ${styles[`level${level}`]}`}>
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          {item.title}
        </Link>
      ) : (
        <button
          onClick={handleToggle}
          className={`${styles.sidebarButton} ${styles[`level${level}`]} ${hasChildren ? styles.hasChildren : ''}`}
          aria-expanded={hasChildren ? isOpen : undefined}
        >
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          <span className={styles.title}>{item.title}</span>
          {hasChildren && (
            <span className={styles.chevron}>
              {isOpen ? (
                <ChevronDownIcon className={styles.chevronIcon} />
              ) : (
                <ChevronRightIcon className={styles.chevronIcon} />
              )}
            </span>
          )}
        </button>
      )}
      
      {hasChildren && isOpen && (
        <div className={styles.children}>
          {item.children!.map((child, index) => (
            <SidebarItemComponent key={index} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>⚡</span>
              <span className={styles.logoText}>KRule</span>
            </div>
          </Link>
          <span className={styles.version}>v1.0.0</span>
        </div>
        
        <nav className={styles.navigation} role="navigation" aria-label="Documentation navigation">
          <div className={styles.navigationContent}>
            {navigationItems.map((item, index) => (
              <SidebarItemComponent key={index} item={item} />
            ))}
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.socialLinks}>
            <a
              href="https://github.com/your-org/krule"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="GitHub repository"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/your-org"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Twitter profile"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;