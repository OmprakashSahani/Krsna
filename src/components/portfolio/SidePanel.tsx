"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import type { Section } from "./sections";
import styles from "./portfolio.module.css";

export function SidePanel({ section, open, onClose, children }: { section: Section; open: boolean; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.scrollTo?.({ top: 0, behavior: "instant" });
    const target = section.id === "note" ? panel.current?.querySelector<HTMLTextAreaElement>("textarea") : heading.current;
    target?.focus({ preventScroll: true });
  }, [open, section.id]);

  useEffect(() => {
    if (!open) return;
    // Keep a mobile sheet above the software keyboard without locking the body.
    const viewport = window.visualViewport;
    const element = panel.current;
    const fit = () => {
      if (!viewport || !element) return;
      element.style.setProperty("--panel-height", `${viewport.height}px`);
      element.style.setProperty("--panel-top", `${viewport.offsetTop}px`);
    };
    fit();
    viewport?.addEventListener("resize", fit);
    viewport?.addEventListener("scroll", fit);
    return () => {
      viewport?.removeEventListener("resize", fit);
      viewport?.removeEventListener("scroll", fit);
      element?.style.removeProperty("--panel-height");
      element?.style.removeProperty("--panel-top");
    };
  }, [open]);

  return <aside ref={panel} id={`portfolio-panel-${section.side}`} className={styles.panel} data-side={section.side} data-open={open} aria-labelledby={`panel-title-${section.side}`} aria-hidden={!open} inert={!open}>
    <div className={styles.panelTop}>
      <h2 id={`panel-title-${section.side}`} ref={heading} tabIndex={-1}><span>{section.index} /</span> {section.label}</h2>
      <Link href="/krishna" className={styles.sheetIdentity}>Krsna</Link>
      <button type="button" onClick={onClose} aria-label={`Close ${section.label.toLowerCase()}`}><span aria-hidden="true">×</span></button>
    </div>
    <div className={styles.panelContent}>{children}</div>
  </aside>;
}
