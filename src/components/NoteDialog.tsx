"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { EMAIL_ERROR, isValidNoteEmail } from "@/lib/contact";
import styles from "./NoteDialog.module.css";

type FormState = "idle" | "submitting" | "success" | "error";

export function NoteDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const unlock = useRef<(() => void) | null>(null);
  const pending = useRef<AbortController | null>(null);
  const backdropPressed = useRef(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  useEffect(() => () => {
    unlock.current?.();
    pending.current?.abort();
  }, []);

  function open() {
    if (!dialog.current || dialog.current.open) return;
    if (state === "success") {
      setState("idle");
      setMessage("");
      setEmail("");
    }
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
      position: "fixed", top: `-${scrollY}px`, left: `-${scrollX}px`,
      width: "100%", overflow: "hidden", paddingRight: `${padding + scrollbar}px`,
    });
    // Mobile keyboards can shrink the visual viewport without changing 100dvh.
    const viewport = window.visualViewport;
    const panel = dialog.current;
    const fitViewport = () => {
      if (!viewport) return;
      panel.style.setProperty("--note-viewport-height", `${viewport.height}px`);
      panel.style.setProperty("--note-viewport-top", `${viewport.offsetTop}px`);
    };
    fitViewport();
    viewport?.addEventListener("resize", fitViewport);
    viewport?.addEventListener("scroll", fitViewport);
    unlock.current = () => {
      viewport?.removeEventListener("resize", fitViewport);
      viewport?.removeEventListener("scroll", fitViewport);
      panel.style.removeProperty("--note-viewport-height");
      panel.style.removeProperty("--note-viewport-top");
      Object.assign(body.style, previous);
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
      unlock.current = null;
    };
    dialog.current.showModal();
    textarea.current?.focus({ preventScroll: true });
  }

  function restoreFocus() {
    backdropPressed.current = false;
    unlock.current?.();
    trigger.current?.focus({ preventScroll: true });
  }

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>(
      "button:not(:disabled), textarea:not(:disabled), input:not(:disabled)",
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || state === "success") return;
    if (!message.trim() || message.length > 3000) {
      setError(message.trim() ? "Please keep your note to 3000 characters or fewer." : "Please write a note first.");
      setState("error");
      textarea.current?.focus();
      return;
    }
    const visitorEmail = email.trim();
    if (!isValidNoteEmail(visitorEmail)) {
      setError(EMAIL_ERROR);
      setState("error");
      emailInput.current?.focus();
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setState("submitting");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, ...(visitorEmail ? { email: visitorEmail } : {}) }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        setError(result.error === "invalid_email" ? EMAIL_ERROR : result.error === "unavailable"
          ? (process.env.NODE_ENV === "development"
            ? "Note delivery is unavailable in this development environment."
            : "Note delivery is currently unavailable. Please try again later.")
          : "Could not send your note. Please try again.");
        setState("error");
        return;
      }
      setState("success");
      setMessage("");
      setEmail("");
    } catch {
      setError("Could not send your note. Please try again.");
      setState("error");
    } finally {
      window.clearTimeout(timeout);
      pending.current = null;
    }
  }

  return (
    <>
      <button ref={trigger} type="button" className={styles.trigger} onClick={open} aria-haspopup="dialog" aria-controls="private-note-dialog">
        Leave a note
      </button>
      <dialog ref={dialog} id="private-note-dialog" className={styles.dialog} aria-modal="true" aria-labelledby="note-title"
        onClose={restoreFocus} onKeyDown={containFocus}
        onPointerDown={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          backdropPressed.current = event.target === event.currentTarget && (
            event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom
          );
        }}
        onPointerCancel={() => { backdropPressed.current = false; }}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          // Both ends must be on the backdrop so selecting text cannot dismiss the note.
          if (backdropPressed.current && event.target === event.currentTarget && (
            event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom
          )) event.currentTarget.close();
          backdropPressed.current = false;
        }}>
        <div className={styles.topline}>
          <p className={styles.eyebrow}>PRIVATE NOTE</p>
          <button type="button" className={styles.close} aria-label="Close note" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <h2 id="note-title" className={styles.title}>WRITE SOMETHING</h2>
        <form onSubmit={submit} noValidate aria-busy={state === "submitting"}>
          <label htmlFor="note-message" className="sr-only">Your note</label>
          <textarea ref={textarea} id="note-message" name="message" className={styles.textarea}
            rows={6} maxLength={3000} required value={message}
            readOnly={state === "submitting" || state === "success"}
            aria-describedby="note-feedback" aria-invalid={state === "error" && (!message.trim() || message.length > 3000)}
            placeholder="Share a thought, suggestion, or anything you'd like me to read."
            onChange={(event) => {
              setMessage(event.target.value);
              if (state === "error") { setState("idle"); setError(""); }
            }} />
          <label htmlFor="note-email" className={styles.emailLabel}>EMAIL (OPTIONAL)</label>
          <input ref={emailInput} id="note-email" name="email" type="email" autoComplete="email"
            className={styles.email} placeholder="you@example.com" value={email}
            readOnly={state === "submitting" || state === "success"}
            aria-describedby="note-email-helper note-feedback" aria-invalid={state === "error" && error === EMAIL_ERROR}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state === "error") { setState("idle"); setError(""); }
            }} />
          <p id="note-email-helper" className={styles.helper}>Leave blank to stay anonymous.</p>
          <p id="note-feedback" className={styles.feedback} role="status" aria-live="polite" aria-atomic="true">
            {state === "success" ? "Note sent." : state === "submitting" ? "Sending…" : error}
          </p>
          <button type="submit" className={styles.submit} disabled={state === "submitting" || state === "success"}>SEND NOTE</button>
        </form>
      </dialog>
    </>
  );
}
