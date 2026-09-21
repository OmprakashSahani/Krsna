"use client";

import { useRef } from "react";
import styles from "./resume.module.css";
import dialogStyles from "./ResumeDownloadDialog.module.css";

const resumePath = "/documents/omprakash-sahani-resume.pdf";

export function ResumeDownloadDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  function open() {
    if (!dialog.current || dialog.current.open) return;

    dialog.current.showModal();
    closeButton.current?.focus({ preventScroll: true });
  }

  function restoreFocus() {
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={styles.downloadPlaceholder}
        onClick={open}
        aria-haspopup="dialog"
        aria-controls="resume-preview-dialog"
      >
        Download Resume
      </button>

      <dialog
        ref={dialog}
        id="resume-preview-dialog"
        className={dialogStyles.dialog}
        aria-modal="true"
        aria-labelledby="resume-preview-title"
        onClose={restoreFocus}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const onBackdrop =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;

          if (event.target === event.currentTarget && onBackdrop) {
            event.currentTarget.close();
          }
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

        <div className={dialogStyles.preview}>
          <object
            className={dialogStyles.document}
            data={resumePath}
            type="application/pdf"
            aria-label="Omprakash Sahani resume preview"
          >
            <p className={dialogStyles.fallback}>
              Your browser could not display the resume preview.
            </p>
          </object>
        </div>

        <footer className={dialogStyles.footer}>
          <a className={dialogStyles.download} href={resumePath} download>
            DOWNLOAD RESUME
          </a>
        </footer>
      </dialog>
    </>
  );
}
