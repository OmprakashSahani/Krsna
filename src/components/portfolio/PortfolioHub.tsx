"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { projectHref, type ProjectSlug } from "@/data/project-details";
import { portfolioState, sectionHref } from "./navigation-state";
import { CentralSystem } from "./CentralSystem";
import { HubNavigation } from "./HubNavigation";
import { SidePanel } from "./SidePanel";
import { AboutPanel } from "./AboutPanel";
import { ResumePanel } from "./ResumePanel";
import { WorkPanel } from "./WorkPanel";
import { FavoritesPanel } from "./FavoritesPanel";
import { ResearchPanel } from "./ResearchPanel";
import { WritingPanel } from "./WritingPanel";
import { ContactPanel } from "./ContactPanel";
import { KrishnaPanel } from "./KrishnaPanel";
import { NotePanel, type NotePanelHandle } from "./NotePanel";
import { panelDefinitions, type PanelId, type SectionId } from "./sections";
import styles from "./portfolio.module.css";

export function PortfolioHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelParams = searchParams.getAll("panel");
  const projectParams = searchParams.getAll("project");
  const { section: active, project } = portfolioState(
    panelParams.length === 1 ? panelParams[0] : undefined,
    projectParams.length === 1 ? projectParams[0] : undefined,
  );
  const initialSide = active ? panelDefinitions.find(item => item.id === active)!.side : null;
  const [visited, setVisited] = useState<PanelId[]>(() => active ? [active] : []);
  const [lastSection, setLastSection] = useState<PanelId>(active ?? "about");
  const [lastOnSide, setLastOnSide] = useState({
    left: initialSide === "left" && active ? active : "about",
    right: initialSide === "right" && active ? active : "favorites",
  } as Record<"left" | "right", PanelId>);
  const [paused, setPaused] = useState(false);
  const note = useRef<NotePanelHandle>(null);
  const stage = useRef<HTMLDivElement>(null);
  const projectTrigger = useRef<HTMLAnchorElement | null>(null);
  const previousProject = useRef(project);
  const previousActive = useRef(active);
  const section = panelDefinitions.find(item => item.id === (active ?? lastSection))!;

  // Retain each side's content and lazy previews across URL navigation, including history.
  if (active && (lastSection !== active || !visited.includes(active))) {
    if (!visited.includes(active)) setVisited([...visited, active]);
    setLastSection(active);
    setLastOnSide({ ...lastOnSide, [section.side]: active });
  }

  function select(id: SectionId) {
    if (id === active && !project) return;
    if (id === "note") note.current?.prepare();
    router.push(sectionHref(id), { scroll: false });
  }

  const close = useCallback(() => {
    router.push("/", { scroll: false });
  }, [router]);

  const closeProject = useCallback(() => {
    // Replacing also works for direct arrivals; Back never reopens a closed detail.
    router.replace(sectionHref("work"), { scroll: false });
  }, [router]);

  function openProject(slug: ProjectSlug, trigger: HTMLAnchorElement) {
    projectTrigger.current = trigger;
    if (project === slug) return;
    router.push(projectHref(slug), { scroll: false });
  }

  useEffect(() => {
    if (previousProject.current && !project && active === "work") {
      const trigger = projectTrigger.current?.isConnected ? projectTrigger.current :
        document.getElementById(`project-view-${previousProject.current}`);
      trigger?.focus({ preventScroll: true });
    } else if (previousActive.current && !active) {
      if (stage.current) stage.current.inert = false;
      document.getElementById(`hub-${previousActive.current}`)?.focus({ preventScroll: true });
    }
    previousProject.current = project;
    previousActive.current = active;
  }, [active, project]);

  useEffect(() => {
    if (searchParams.has("project") && (!project || searchParams.get("panel") !== "work")) {
      router.replace(project ? projectHref(project) : sectionHref(active), { scroll: false });
    }
  }, [active, project, router, searchParams]);

  useEffect(() => {
    if (!active) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); if (project) closeProject(); else close(); }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [active, project, close, closeProject]);

  useEffect(() => {
    // Desktop panels are nonmodal. Only the covered mobile stage is inert.
    const media = window.matchMedia("(max-width: 800px)");
    const update = () => { if (stage.current) stage.current.inert = Boolean(active) && media.matches; };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [active]);

  const panels = {
    about: <AboutPanel />, resume: <ResumePanel showPreview={visited.includes("resume")} />, work: <WorkPanel active={active === "work"} showPreview={visited.includes("work")} project={project} onProject={openProject} onBack={closeProject} />,
    favorites: <FavoritesPanel active={active === "favorites"} />, research: <ResearchPanel />, writing: <WritingPanel />,
    contact: <ContactPanel />, note: <NotePanel ref={note} />, krishna: <KrishnaPanel />,
  };

  return <main id="main-content" className={`portfolio-home ${styles.hub}`} data-panel={active ? section.side : "closed"}>
    <div ref={stage} className={styles.stage}>
      <div className={styles.identityNote}>Omprakash Sahani <span>/ a practice in learning</span></div>
      <CentralSystem paused={paused} onToggleMotion={() => setPaused(previous => !previous)} />
      <HubNavigation active={active} onSelect={select} />
    </div>
    {(["left", "right"] as const).map(side => {
      const current = panelDefinitions.find(item => item.id === lastOnSide[side])!;
      return <SidePanel key={side} section={current} open={active !== null && section.side === side} onClose={close}>
        {panelDefinitions.filter(item => item.side === side).map(item => <div key={item.id} hidden={item.id !== current.id}>{panels[item.id]}</div>)}
      </SidePanel>;
    })}
  </main>;
}
