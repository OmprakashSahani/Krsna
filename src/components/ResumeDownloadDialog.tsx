"use client";

import { useEffect, useRef } from "react";
import dialogStyles from "./ResumeDownloadDialog.module.css";

import { ResumeDocument } from "./portfolio/ResumePanel";

export function ResumeDownloadDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const unlock = useRef<(() => void) | null>(null);
  const backdropPressed = useRef(false);

  useEffect(() => () => {
    unlock.current?.();
  }, []);

  function open() {
    if (!dialog.current || dialog.current.open) return;

    const { scrollX, scrollY } = window;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const padding = parseFloat(getComputedStyle(body).paddingRight);

    Object.assign(body.style, {
      position: "fixed",
      top: `-${scrollY}px`,
      left: `-${scrollX}px`,
      width: "100%",
      overflow: "hidden",
      paddingRight: `${padding + scrollbar}px`,
    });

    unlock.current = () => {
      Object.assign(body.style, previous);
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
      unlock.current = null;
    };

    dialog.current.showModal();
    closeButton.current?.focus({ preventScroll: true });
  }

  function restoreFocus() {
    backdropPressed.current = false;
    unlock.current?.();
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={dialogStyles.trigger}
        onClick={open}
        aria-haspopup="dialog"
        aria-controls="resume-preview-dialog"
      >
        Resume
      </button>

      <dialog
        ref={dialog}
        id="resume-preview-dialog"
        className={dialogStyles.dialog}
        aria-modal="true"
        aria-labelledby="resume-preview-title"
        onClose={restoreFocus}
        onPointerDown={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          backdropPressed.current =
            event.target === event.currentTarget &&
            (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            );
        }}
        onPointerCancel={() => {
          backdropPressed.current = false;
        }}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const onBackdrop =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;

          if (
            backdropPressed.current &&
            event.target === event.currentTarget &&
            onBackdrop
          ) {
            event.currentTarget.close();
          }

          backdropPressed.current = false;
        }}
      >
        <header className={dialogStyles.header}>
          <div>
            <p className={dialogStyles.eyebrow}>RESUME</p>
            <h2 id="resume-preview-title" className={dialogStyles.title}>
              Omprakash Sahani
            </h2>
          </div>

          <button
            ref={closeButton}
            type="button"
            className={dialogStyles.close}
            aria-label="Close resume preview"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </header>

        <ResumeDocument />
      </dialog>
    </>
  );
}
