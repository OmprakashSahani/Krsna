import styles from "./panels.module.css";

export function ContactPanel() {
  return <>
    <p className={styles.intro}>If you&apos;re working on something interesting in ML systems, research engineering, developer tools, or just want to say hello, feel free to reach out.</p>
    <div className={styles.contactLinks}>
      <a href="mailto:Omprakash.Sahani1206@gmail.com"><i className="fas fa-envelope" aria-hidden="true" /><span><span className={styles.annotation}>Email</span>Omprakash.Sahani1206@gmail.com</span><span aria-hidden="true">↗</span></a>
      <a href="https://github.com/OmprakashSahani" target="_blank" rel="noopener noreferrer"><i className="fab fa-github" aria-hidden="true" /><span><span className={styles.annotation}>GitHub</span>@OmprakashSahani</span><span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
      <a href="https://www.linkedin.com/in/omprakashsahani/" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin" aria-hidden="true" /><span><span className={styles.annotation}>LinkedIn</span>Omprakash Sahani</span><span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
    </div>
  </>;
}
