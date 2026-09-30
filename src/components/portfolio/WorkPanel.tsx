"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import { projects, type Project } from "@/data/projects";
import { projectHref, type ProjectSlug } from "@/data/project-details";
import { ProjectDetailContent } from "@/components/projects/ProjectDetailContent";
import styles from "./panels.module.css";

const currentProjects: Project[] = [
  projects.find(project => project.title === "LeRobot State Atlas")!,
  {
    title: "SplatLab",
    description:
      "Gaussian Splatting tool for asset inspection, camera analysis, rendering, and performance diagnostics.",
    area: "Gaussian Splatting",
    repository: "https://github.com/OmprakashSahani-Labs/splatlab",
  },
  ...[
    "SearchEval Lab",
    "EvidencePatch",
    "Codex Benchmark Guardian",
    "ThermalShift AI",
    "Atlas AI",
  ].map(title => projects.find(project => project.title === title)!),
];

export function WorkPanel({ active, showPreview, project: selectedProject, onProject, onBack }: {
  active: boolean;
  showPreview: boolean;
  project: ProjectSlug | null;
  onProject: (slug: ProjectSlug) => void;
  onBack: () => void;
}) {
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
    if (!active || selectedProject) {
      list.current?.querySelectorAll("video").forEach(video => {
        if (!video.paused) video.pause();
      });
    }
  }, [active, selectedProject]);
  return <>
    <div ref={list} hidden={Boolean(selectedProject)}>
      {currentProjects.map((project, index) => <article key={project.title} className={styles.project}>
        <p className={styles.annotation}>{String(index + 1).padStart(2, "0")} / {project.area}</p>
        <h3>{project.title}</h3><p>{project.description}</p>
        {showPreview && project.preview?.type === "video" && (
          <video
            className={styles.video}
            src={project.preview.src}
            poster={project.preview.poster}
            aria-label={project.preview.label}
            controls
            playsInline
            preload="metadata"
          />
        )}
        {showPreview && project.preview?.type === "certificate" && (
          <a
            href={project.preview.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} certificate (opens in a new tab)`}
          >
            <Image
              className={styles.video}
              src={project.preview.src}
              alt={project.preview.alt}
              width={project.preview.width}
              height={project.preview.height}
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </a>
        )}
        <div className={styles.projectLinks}>
          {project.slug && <a id={`project-view-${project.slug}`} href={projectHref(project.slug)} aria-label={`${project.title} — View project`} onClick={event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            listScroll.current = list.current?.closest("aside")?.scrollTop ?? 0;
            onProject(project.slug!);
          }}>View project ↗</a>}
          {project.liveDemo && (
            <a
              href={project.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} — Live demo (opens in a new tab)`}
            >
              Live demo ↗
            </a>
          )}
          <a href={project.repository} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} — GitHub (opens in a new tab)`}>GitHub ↗</a>
        </div>
      </article>)}
    </div>
    {selectedProject && <ProjectDetailContent project={selectedProject} onBack={onBack} />}
  </>;
}
