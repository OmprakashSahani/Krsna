import type { Metadata } from "next";
import Link from "next/link";
import { resume } from "@/data/resume";
import styles from "./resume.module.css";

export const metadata: Metadata = {
  title: { absolute: "Resume — Omprakash Sahani" },
  description: "Detailed technical resume for Omprakash Sahani, covering software engineering, ML systems, distributed systems, evaluation, and robot learning.",
};

export default function ResumePage() {
  return (
    <main id="main-content" className={styles.resumePage}>
      <header className={styles.resumeHeader}>
        <Link className={styles.backLink} href="/" aria-label="Return to homepage">←</Link>
        <span className={styles.downloadPlaceholder}>Download Resume</span>
      </header>

      <article className={styles.resumeComposition}>
        <header className={styles.intro}>
          <h1>{resume.personal.name}</h1>
          <p className={styles.positioning}>{resume.personal.positioning}</p>
          <address className={styles.contactList}>
            <span>{resume.personal.location}</span>
            {resume.contacts.map((contact) => contact.href ? (
              <a key={contact.label} href={contact.href} target={contact.external ? "_blank" : undefined} rel={contact.external ? "noopener noreferrer" : undefined}>
                {contact.value}
                {contact.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            ) : <span key={contact.label}>{contact.value}</span>)}
          </address>
        </header>

        <section className={styles.resumeSection} aria-labelledby="profile-heading">
          <h2 id="profile-heading">Profile</h2>
          <div className={styles.prose}>
            {resume.summary.map((paragraph) => <p key={paragraph.text}>{paragraph.text}</p>)}
          </div>
        </section>

        <section className={styles.resumeSection} aria-labelledby="experience-heading">
          <h2 id="experience-heading">Technical Experience</h2>
          {resume.experience.map((experience) => (
            <article className={styles.entry} key={experience.title}>
              <div className={styles.entryHeading}>
                <h3>{experience.title}</h3>
                <p>{experience.date}</p>
              </div>
              <ul>{experience.bullets.map((bullet) => <li key={bullet.text}>{bullet.text}</li>)}</ul>
            </article>
          ))}
        </section>

        <section className={styles.resumeSection} aria-labelledby="projects-heading">
          <h2 id="projects-heading">Selected Projects</h2>
          <div className={styles.projectList}>
            {resume.projects.map((project) => (
              <article className={styles.entry} key={project.name}>
                <div className={styles.projectHeading}>
                  <div>
                    <h3>{project.name}</h3>
                    {project.subtitle ? <p>{project.subtitle}</p> : null}
                  </div>
                  {project.repository ? (
                    <a href={project.repository} target="_blank" rel="noopener noreferrer">
                      Repository<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null}
                </div>
                <p className={styles.topics}>{project.topics.join(" · ")}</p>
                <ul>{project.bullets.map((bullet) => <li key={bullet.text}>{bullet.text}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.resumeSection} aria-labelledby="education-heading">
          <h2 id="education-heading">Education</h2>
          <div className={styles.educationList}>
            {resume.education.map((education) => (
              <article className={styles.entry} key={education.institution}>
                <div className={styles.entryHeading}>
                  <div>
                    <h3>{education.institution}</h3>
                    <p>{education.qualification}{education.field ? ` · ${education.field}` : ""}</p>
                  </div>
                  <p>{education.date}</p>
                </div>
                <p className={styles.entryMeta}>{education.location} · {education.details.join(" · ")}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.resumeSection} aria-labelledby="skills-heading">
          <h2 id="skills-heading">Technical Skills</h2>
          <dl className={styles.skillList}>
            {resume.skills.map((group) => (
              <div key={group.category}>
                <dt>{group.category}</dt>
                <dd>{group.skills.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.resumeSection} aria-labelledby="research-heading">
          <h2 id="research-heading">Research Interests</h2>
          <ul className={styles.researchList}>
            {resume.researchInterests.map((interest) => <li key={interest.text}>{interest.text}</li>)}
          </ul>
        </section>

      </article>

      <div className={styles.resumeFooterRule} aria-hidden="true" />
    </main>
  );
}
