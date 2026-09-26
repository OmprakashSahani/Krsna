"use client";

import { useEffect, useImperativeHandle, useRef, useState, type FormEvent, type Ref } from "react";
import { EMAIL_ERROR, isValidNoteEmail } from "@/lib/contact";
import styles from "./panels.module.css";

type FormState = "idle" | "submitting" | "success" | "error";
export type NotePanelHandle = { prepare: () => void };

export function NotePanel({ ref }: { ref?: Ref<NotePanelHandle> }) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const pending = useRef<AbortController | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  useEffect(() => () => { pending.current?.abort(); }, []);
  useImperativeHandle(ref, () => ({ prepare() {
    if (state === "success") { setState("idle"); setError(""); }
  } }), [state]);

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
      if (response.status === 429) {
        setError("Too many notes sent recently. Please try again in a few minutes.");
        setState("error");
        return;
      }
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

  return <div>
    <p className={styles.intro}>A private note. A thought, suggestion, or anything you’d like me to read.</p>
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
  </div>;
}
