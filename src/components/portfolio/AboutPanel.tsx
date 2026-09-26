import Image from "next/image";
import { aboutStories } from "@/data/about";
import styles from "./panels.module.css";

export function AboutPanel() {
  const [introduction, background, ...remainingStories] = aboutStories;

  return <div className={styles.about}>
    <section className={styles.story} aria-labelledby="about-introduction">
      <div className={styles.aboutHero}>
        <figure className={styles.portrait}>
          <Image src="/images/about/omprakash-r-sahani.png" alt="Omprakash Sahani" width={1254} height={1254} sizes="(max-width: 1200px) 280px, 20vw" />
        </figure>
        <div>
          <p className={styles.aboutName}>Omprakash Sahani</p>
          <p className={styles.aboutProfession}>Software Engineer</p>
          <h3 id="about-introduction">{introduction.title}</h3>
          {introduction.paragraphs.map((paragraph, index) => <p key={index} className={styles[paragraph.kind]}>{paragraph.text}</p>)}
        </div>
      </div>
      <hr className={styles.aboutHeroDivider} />
      {background.paragraphs.map((paragraph, index) => <p key={index} className={styles[paragraph.kind]}>{paragraph.text}</p>)}
    </section>
    {remainingStories.map(story => <section key={story.id} className={styles.story} aria-labelledby={`about-${story.id}`}>
      <h3 id={`about-${story.id}`}>{story.title}</h3>
      {story.paragraphs.map((paragraph, index) => {
        if (paragraph.kind === "question") {
          if (story.paragraphs[index - 1]?.kind === "question") return null;
          return <div key={index} className={styles.questionTransition}>
            {story.paragraphs.filter(item => item.kind === "question").map((question, questionIndex) => <p key={questionIndex} className={styles.question}>{question.text}</p>)}
          </div>;
        }
        if (paragraph.kind === "process") return <p key={index} className={styles.process}>
          <span className={styles.processStart} aria-hidden="true" />
          <span>{paragraph.text}</span>
          <span className={styles.processEnd} aria-hidden="true" />
        </p>;
        return <p key={index} className={styles[paragraph.kind]}>{paragraph.text}</p>;
      })}
    </section>)}
  </div>;
}
