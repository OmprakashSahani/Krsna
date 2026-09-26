import styles from "./panels.module.css";

export const resumePath = "/documents/omprakash-sahani-resume.pdf";

// Shared with the resume dialog used on secondary routes.
export function ResumeDocument() {
  return <>
    <div className={styles.resumeActions}>
      <a className={styles.action} href={resumePath} download>DOWNLOAD RESUME <span aria-hidden="true">↓</span></a>
      <a href={resumePath} target="_blank" rel="noopener noreferrer">Open PDF<span className="sr-only"> (opens in a new tab)</span> ↗</a>
    </div>
    <div className={styles.document}>
      <object className={styles.documentEmbed} data={resumePath} type="application/pdf" aria-label="Omprakash Sahani resume preview">
        <p>Preview unavailable in this browser. <a href={resumePath}>Read the resume PDF</a> or use the download above.</p>
      </object>
    </div>
  </>;
}

export function ResumePanel() {
  return <><h3 className={styles.title}>Omprakash Sahani</h3><p className={styles.annotation}>Resume / PDF document</p><ResumeDocument /></>;
}
