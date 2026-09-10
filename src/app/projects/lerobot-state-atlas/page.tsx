import type { Metadata } from "next";
import Link from "next/link";
import { ViewerEntry } from "@/components/lerobot/ViewerEntry";
import styles from "./lerobot-state-atlas.module.css";

const title = "LeRobot State Atlas — Omprakash Sahani";
const description = "Analyze and visualize state-space and tool-workspace coverage in LeRobot datasets.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/projects/lerobot-state-atlas" },
  openGraph: { type: "website", title, description, siteName: "Omprakash Sahani" },
  twitter: { card: "summary", title, description },
};

export default function LeRobotStateAtlasPage() {
  return (
    <main id="main-content" className={styles.projectPage}>
      <header className={styles.projectHeader}>
        <Link href="/" className={styles.backLink} aria-label="Return to homepage">←</Link>
        <a className={styles.githubLink} href="https://github.com/OmprakashSahani/lerobot-state-atlas" target="_blank" rel="noopener noreferrer">
          GitHub<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </header>
      <div className={styles.projectComposition}>
        <section className={styles.intro} aria-labelledby="project-title">
          <p className={styles.label}>PROJECT / ROBOT LEARNING</p>
          <h1 id="project-title">LeRobot State Atlas</h1>
          <p className={styles.description}>{description}</p>
        </section>
        <ViewerEntry />
      </div>
      <div className={styles.footerRule} aria-hidden="true" />
    </main>
  );
}
