"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { projects, type Project } from "@/data/projects";
import styles from "./panels.module.css";

const currentProjects: Project[] = [
  projects.find(project => project.title === "LeRobot State Atlas")!,
  { number: "", title: "SplatLab", description: "Engineering and debugging tool for Gaussian Splatting.", area: "Gaussian Splatting", repository: "https://github.com/OmprakashSahani-Labs/splatlab" },
  ...["SearchEval Lab", "EvidencePatch", "Atlas AI"].map(title => projects.find(project => project.title === title)!),
];

export function WorkPanel({ active, showPreview }: { active: boolean; showPreview: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!active && video.current && !video.current.paused) video.current.pause();
  }, [active]);
  return <>
    <div className={styles.projectList}>
      {currentProjects.map((project, index) => <article key={project.title} className={styles.project}>
        <p className={styles.annotation}>{String(index + 1).padStart(2, "0")} / {project.area}</p>
        <h3>{project.title}</h3><p>{project.description}</p>
        {index === 0 && showPreview && <video ref={video} className={styles.video} src="/videos/projects/lerobot-state-atlas/gaussian-splat-demo.mp4" poster="/images/projects/lerobot-workspace.jpg" aria-label="Gaussian Splat workspace reconstruction demo" controls playsInline preload="metadata" />}
        <div className={styles.projectLinks}>
          {project.page && <Link href={project.page} aria-label={`${project.title} — View project`}>View project ↗</Link>}
          <a href={project.repository} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} — GitHub (opens in a new tab)`}>GitHub ↗</a>
        </div>
      </article>)}
    </div>
    <Link className={styles.action} href="/projects">Full project index <span aria-hidden="true">↗</span></Link>
  </>;
}
