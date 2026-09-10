import type { Metadata } from "next";
import Link from "next/link";
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
        <nav className={styles.projectActions} aria-label="Project exploration">
          <Link className={styles.primaryAction} href="/projects/lerobot-state-atlas/shared-world" prefetch={false}>
            Open shared world <span aria-hidden="true">→</span>
          </Link>
          <a href="#methodology">Methodology ↓</a>
        </nav>
        <div className={styles.projectNarrative}>
          <section aria-labelledby="about-atlas">
            <p className={styles.sectionIndex}>01 / PURPOSE</p>
            <div>
              <h2 id="about-atlas">Read the dataset through its workspace.</h2>
              <p>LeRobot State Atlas is a dataset diagnostics tool for inspecting state-space and tool-workspace coverage. It brings left and right arm coverage into one shared world, connecting occupied space to the episodes that reached it.</p>
              <p>Move from an overview of coverage to a local radius query, then inspect the episode evidence behind that region.</p>
            </div>
          </section>
          <section id="methodology" aria-labelledby="methodology-heading">
            <p className={styles.sectionIndex}>02 / METHODOLOGY</p>
            <div>
              <h2 id="methodology-heading">Coverage, with evidence attached.</h2>
              <dl className={styles.measurements}>
                <div><dt>Visits &amp; distinct episodes</dt><dd>Compare arm-specific tool-point visits, log visits, and exact distinct-episode counts on a shared metric scale. One dataset frame can contribute both a left and a right tool visit.</dd></div>
                <div><dt>Radius queries &amp; uncommon space</dt><dd>Select an occupied voxel to inspect nearby entries and their exact episode union. Uncommon-space ranking highlights episodes that touch entries shared with fewer exported coverage episodes.</dd></div>
                <div><dt>Recorded trajectories</dt><dd>Follow available trajectories in the same scene, with recorded orientation and raw gripper values where available. These values do not establish calibrated physical jaw width.</dd></div>
              </dl>
            </div>
          </section>
          <section aria-labelledby="demo-heading">
            <p className={styles.sectionIndex}>03 / DEMO BOUNDARY</p>
            <div>
              <h2 id="demo-heading">A shared world. An explicit scope.</h2>
              <p>The pinned demo-v2 bundle contains coverage for episodes 0–9. Trajectories exist for episodes 0 and 1; episodes 2–9 are coverage-only. Synchronized video is absent.</p>
              <p>Arm spacing is provisional and adjustable at runtime. The scene uses a procedural grid; demo-v2 contains no validated environment scan. Coverage describes this export, not task success or the full physical workspace.</p>
              <p className={styles.sourceNote}>Adapted from LeRobot State Atlas under Apache-2.0.<br />Pinned source <code>39116927d8d0</code>.</p>
            </div>
          </section>
        </div>
      </div>
      <div className={styles.footerRule} aria-hidden="true" />
    </main>
  );
}
