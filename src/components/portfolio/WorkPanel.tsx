"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { projects, type Project } from "@/data/projects";
import { projectHref, type ProjectSlug } from "@/data/project-details";
import { ProjectDetailContent } from "@/components/projects/ProjectDetailContent";
import styles from "./panels.module.css";

const currentProjects: Project[] = [
  projects.find(project => project.title === "LeRobot State Atlas")!,
  { title: "SplatLab", description: "Engineering and debugging tool for Gaussian Splatting.", area: "Gaussian Splatting", repository: "https://github.com/OmprakashSahani-Labs/splatlab" },
  ...["SearchEval Lab", "EvidencePatch", "Atlas AI"].map(title => projects.find(project => project.title === title)!),
];

export function WorkPanel({ active, showPreview, project: selectedProject, onProject, onBack }: {
  active: boolean;
  showPreview: boolean;
  project: ProjectSlug | null;
  onProject: (slug: ProjectSlug) => void;
  onBack: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const listScroll = useRef(0);
  const previousProject = useRef(selectedProject);

  useLayoutEffect(() => {
    const panel = list.current?.closest("aside");
    if (active && panel) {
      if (selectedProject) panel.scrollTop = 0;
      else if (previousProject.current) panel.scrollTop = listScroll.current;
    }
    previousProject.current = selectedProject;
  }, [active, selectedProject]);

  useLayoutEffect(() => {
    if (!active || selectedProject) return;
    const panel = list.current?.closest("aside");
    // Remember list scrolling for browser Back/Forward as well as trigger clicks.
    const rememberScroll = () => { if (panel) listScroll.current = panel.scrollTop; };
    panel?.addEventListener("scroll", rememberScroll);
    return () => panel?.removeEventListener("scroll", rememberScroll);
  }, [active, selectedProject]);

  useEffect(() => {
    if ((!active || selectedProject) && video.current && !video.current.paused) video.current.pause();
  }, [active, selectedProject]);
  return <>
    <div ref={list} hidden={Boolean(selectedProject)}>
      {currentProjects.map((project, index) => <article key={project.title} className={styles.project}>
        <p className={styles.annotation}>{String(index + 1).padStart(2, "0")} / {project.area}</p>
        <h3>{project.title}</h3><p>{project.description}</p>
        {index === 0 && showPreview && <video ref={video} className={styles.video} src="/videos/projects/lerobot-state-atlas/gaussian-splat-demo.mp4" poster="/images/projects/lerobot-workspace.jpg" aria-label="Gaussian Splat workspace reconstruction demo" controls playsInline preload="metadata" />}
        <div className={styles.projectLinks}>
          {project.slug && <a id={`project-view-${project.slug}`} href={projectHref(project.slug)} aria-label={`${project.title} — View project`} onClick={event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            listScroll.current = list.current?.closest("aside")?.scrollTop ?? 0;
            onProject(project.slug!);
          }}>View project ↗</a>}
          <a href={project.repository} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} — GitHub (opens in a new tab)`}>GitHub ↗</a>
        </div>
      </article>)}
    </div>
    {selectedProject && <ProjectDetailContent project={selectedProject} onBack={onBack} />}
  </>;
}
