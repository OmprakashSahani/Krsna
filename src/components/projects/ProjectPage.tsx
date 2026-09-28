import type { ReactNode } from "react";
import styles from "./project-page.module.css";

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
      <h3 id={headingId}>{title}</h3>
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
      <h4 id={headingId} className={styles.sectionHeading}>{title}</h4>
      {children}
    </section>
  );
}

export function ProjectRailSection({ headingId, title, children, className }: ProjectSectionProps) {
  return (
    <section className={[styles.railSection, className].filter(Boolean).join(" ")} aria-labelledby={headingId}>
      <h4 id={headingId} className={styles.sectionHeading}>{title}</h4>
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

export function ProjectTrace() {
  return (
    <div className={styles.horizontalTrace} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
    </div>
  );
}
