import styles from "./panels.module.css";

export function WritingPanel() {
  return <div className={styles.writing}><span className={styles.annotation} aria-hidden="true">[ … ]</span><h3 className={styles.title}>Coming soon.</h3><p>Notes, experiments, and things I am still trying to understand.</p></div>;
}
