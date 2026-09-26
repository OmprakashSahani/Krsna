"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { NotePanel, type NotePanelHandle } from "./NotePanel";
import { sections, type SectionId } from "./sections";
import styles from "./portfolio.module.css";

export function PortfolioHub({ initialSection = null }: { initialSection?: SectionId | null }) {
  const initialSide = initialSection ? sections.find(item => item.id === initialSection)!.side : null;
  const [active, setActive] = useState<SectionId | null>(initialSection);
  const [lastSection, setLastSection] = useState<SectionId>(initialSection ?? "about");
  const [lastOnSide, setLastOnSide] = useState({
    left: initialSide === "left" && initialSection ? initialSection : "about",
    right: initialSide === "right" && initialSection ? initialSection : "favorites",
  } as Record<"left" | "right", SectionId>);
  const [paused, setPaused] = useState(false);
  const note = useRef<NotePanelHandle>(null);
  const stage = useRef<HTMLDivElement>(null);
  const section = sections.find(item => item.id === (active ?? lastSection))!;

  function select(id: SectionId) {
    if (id === active) return;
    if (id === "note") note.current?.prepare();
    setActive(id);
    setLastSection(id);
    const side = sections.find(item => item.id === id)!.side;
    setLastOnSide(previous => ({ ...previous, [side]: id }));
  }

  const close = useCallback(() => {
    setActive(null);
    // The sheet's inert background must become interactive before focus returns.
    if (stage.current) stage.current.inert = false;
    document.getElementById(`hub-${lastSection}`)?.focus({ preventScroll: true });
  }, [lastSection]);

  useEffect(() => {
    if (!active) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [active, close]);

  useEffect(() => {
    // Desktop panels are nonmodal. Only the covered mobile stage is inert.
    const media = window.matchMedia("(max-width: 800px)");
    const update = () => { if (stage.current) stage.current.inert = Boolean(active) && media.matches; };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [active]);

  const panels = {
    about: <AboutPanel />, resume: <ResumePanel />, work: <WorkPanel active={active === "work"} />,
    favorites: <FavoritesPanel active={active === "favorites"} />, research: <ResearchPanel />, writing: <WritingPanel />,
    contact: <ContactPanel />, note: <NotePanel ref={note} />,
  };

  return <main id="main-content" className={`portfolio-home ${styles.hub}`} data-panel={active ? section.side : "closed"}>
    <div className={styles.registrationMarks} aria-hidden="true"><span /><span /><span /><span /></div>
    <div ref={stage} className={styles.stage}>
      <div className={styles.identityNote}>Omprakash Sahani <span>/ a practice in learning</span></div>
      <CentralSystem paused={paused} onToggleMotion={() => setPaused(previous => !previous)} />
      <HubNavigation active={active} onSelect={select} />
    </div>
    {(["left", "right"] as const).map(side => {
      const current = sections.find(item => item.id === lastOnSide[side])!;
      return <SidePanel key={side} section={current} open={active !== null && section.side === side} onClose={close}>
        {sections.filter(item => item.side === side).map(item => <div key={item.id} hidden={item.id !== current.id}>{panels[item.id]}</div>)}
      </SidePanel>;
    })}
  </main>;
}
