'use-client';
import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.text}>
          Built with passion by a software developer who loves creating innovative products and ideas
        </p>
      </div>
    </footer>
  );
}