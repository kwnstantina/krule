import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div style={{
          background: "#f0f8ff",
          border: "2px solid #007bff",
          borderRadius: "8px", 
          padding: "2rem", 
          margin: "2rem 0",
          textAlign: "center"
        }}>
          <h2 style={{ color: "#007bff", marginBottom: "1rem" }}>
            🚀 KRule - Rule Engine Builder
          </h2>
          <p style={{ marginBottom: "1.5rem", color: "#333" }}>
            Interactive UI to build, test, and export rules for different use case scenarios
          </p>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              background: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "500",
              fontSize: "1.1rem"
            }}
          >
            Launch Rule Builder →
          </a>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
            Make sure the web app is running: <code>pnpm --filter web dev</code>
          </p>
        </div>
      </main>
    </div>
  );
}
