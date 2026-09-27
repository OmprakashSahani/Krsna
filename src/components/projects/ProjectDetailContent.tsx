"use client";

import { useEffect, useRef } from "react";
import { projectDetails, type ProjectSlug } from "@/data/project-details";
import LeRobotStateAtlasContent from "./LeRobotStateAtlasContent";
import SearchEvalLabContent from "./SearchEvalLabContent";
import EvidencePatchContent from "./EvidencePatchContent";
import styles from "./project-detail-content.module.css";

const content = {
  "lerobot-state-atlas": LeRobotStateAtlasContent,
  "searcheval-lab": SearchEvalLabContent,
  evidencepatch: EvidencePatchContent,
};

// Body content only: Work's existing SidePanel owns the header, surface and scroll.
export function ProjectDetailContent({ project, onBack }: { project: ProjectSlug; onBack: () => void }) {
  const back = useRef<HTMLButtonElement>(null);
  const Content = content[project];

  useEffect(() => { back.current?.focus({ preventScroll: true }); }, [project]);

  return <section className={styles.detail} aria-label={`${projectDetails[project].title} case study`} data-project={project}>
    <button ref={back} className={styles.back} type="button" onClick={onBack} data-panel-autofocus>← CURRENT WORK</button>
    <Content key={project} />
  </section>;
}
