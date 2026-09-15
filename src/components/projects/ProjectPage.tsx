import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./project-page.module.css";

export function ProjectPageHeader({
  title,
  backHref,
  backLabel,
}: {
  title: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <header className={styles.projectHeader}>
      <Link className={styles.backLink} href={backHref} aria-label={backLabel}>←</Link>
      <span className={styles.projectLabel}>{title}</span>
    </header>
  );
}

export function ProjectIntro({
  headingId,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  headingId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.intro}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 id={headingId}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      {children}
    </div>
  );
}

type ProjectSectionProps = {
  headingId: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export function ProjectStorySection({ headingId, title, children, className }: ProjectSectionProps) {
  return (
    <section className={[styles.storySection, className].filter(Boolean).join(" ")} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionHeading}>{title}</h2>
      {children}
    </section>
  );
}

export function ProjectRailSection({ headingId, title, children, className, trace }: ProjectSectionProps & { trace?: "left" }) {
  return (
    <section className={[styles.railSection, className].filter(Boolean).join(" ")} aria-labelledby={headingId}>
      {trace === "left" && <span className={styles.leftRailMarker} aria-hidden="true" />}
      <h2 id={headingId} className={styles.sectionHeading}>{title}</h2>
      {children}
    </section>
  );
}

export function ProjectExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={styles.externalLink} href={href} target="_blank" rel="noopener noreferrer">
      <span>{children}</span><span aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

// Place this horizontal trace at the content edge; rail traces retain their existing layout.
export function ProjectTrace() {
  return (
    <div className={styles.horizontalTrace} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
    </div>
  );
}
