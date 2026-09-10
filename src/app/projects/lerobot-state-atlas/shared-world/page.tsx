import type { Metadata } from "next";
import Link from "next/link";

import { ViewerEntry } from "@/components/lerobot/ViewerEntry";

import styles from "../lerobot-state-atlas.module.css";

const title = "Shared World — LeRobot State Atlas — Omprakash Sahani";
const description =
  "Explore LeRobot workspace coverage, trajectories, and coverage evidence in a canonical shared world.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/projects/lerobot-state-atlas/shared-world" },
  openGraph: {
    type: "website",
    title,
    description,
    siteName: "Omprakash Sahani",
  },
  twitter: { card: "summary", title, description },
};

export default function LeRobotSharedWorldPage() {
  return (
    <main id="main-content" className={`${styles.projectPage} ${styles.sharedPage}`}>
      <header className={styles.projectHeader}>
        <Link
          href="/projects/lerobot-state-atlas"
          className={styles.backLink}
          aria-label="Return to LeRobot State Atlas"
        >
          ←
        </Link>
        <a
          className={styles.githubLink}
          href="https://github.com/OmprakashSahani/lerobot-state-atlas"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </header>

      <div className={styles.projectComposition}>
        <section className={`${styles.intro} ${styles.sharedIntro}`} aria-labelledby="shared-world-title">
          <p className={styles.label}>LEROBOT STATE ATLAS / SHARED WORLD</p>
          <h1 id="shared-world-title">Canonical Shared World</h1>
          <p className={styles.description}>Inspect dual-arm coverage, query occupied space, and follow recorded trajectories in one shared scene.</p>
        </section>

        <ViewerEntry />
      </div>

      <div className={styles.footerRule} aria-hidden="true" />
    </main>
  );
}
