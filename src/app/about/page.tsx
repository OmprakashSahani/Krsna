import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "About Omprakash Sahani and his work across ML systems, software engineering, distributed systems, and evaluation.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main-content" className={styles.aboutPage}>
      <header className={styles.aboutHeader}>
        <Link className={styles.backLink} href="/" aria-label="Return to homepage">←</Link>
        <span className={styles.notation} aria-hidden="true">∇L(θ)</span>
      </header>

      <article className={styles.profile} aria-labelledby="about-name">
        <div className={styles.hero}>
          <p className={styles.aboutLabel}>About</p>
          <Image
            className={styles.portrait}
            src="/images/about/omprakash-r-sahani.png"
            alt="Omprakash Sahani"
            width={1254}
            height={1254}
            sizes="(max-width: 720px) min(100vw - 40px, 448px), (max-width: 900px) 448px, 320px"
            loading="eager"
          />
          <h1 id="about-name" className={styles.name}>Omprakash Sahani</h1>
          <div className={styles.opening}>
            <h2 id="beginnings-heading" className={styles.sectionLabel}>I did not start with computers</h2>
            <p>I did not grow up knowing much about computers, software, or technology.</p>
          </div>
        </div>

        <div className={styles.bodyGrid}>
          <div className={styles.narrative}>
            <section className={`${styles.readingWidth} ${styles.continuation}`} aria-labelledby="beginnings-heading">
              <p>After 12th, I first took admission in Nanoscience and Nanotechnology at Shivaji University. But after some time, I realised it was not the direction I was curious about, so I changed my path and joined a Diploma in Computer Engineering.</p>
              <p>When I started, I knew almost nothing about computers. I did not properly know C or C++, or even how programs were written and executed using software. I had to study hard, struggle through many things, make mistakes, and slowly understand them.</p>
              <p>Later, I continued with B.Tech in Computer Science and Engineering.</p>
              <p>During B.Tech, I was mostly focused on academics and marks. I was learning, but I was not really thinking about building something independently yet.</p>
              <p>That curiosity came later.</p>
            </section>

            <section className={`${styles.readingWidth} ${styles.storySection}`} aria-labelledby="models-heading">
              <h2 id="models-heading" className={styles.sectionLabel}>From building models to understanding what is underneath them</h2>
              <p>After B.Tech, I was considering graduate study in Data Science, Machine Learning, AI, or Computer Science abroad.</p>
              <p>While preparing for that, I realised that academic knowledge alone was not enough. I needed practical experience. I needed to build things.</p>
              <p>So I started with applied machine-learning projects—brain-tumor prediction using CNNs, diabetes prediction, and projects related to environment and energy.</p>
              <p>At first, I was building them mainly to strengthen my portfolio.</p>
              <p>But as I continued learning and building, the question in my mind started changing.</p>
              <div className={styles.questions}>
                <p>Can I build a model?</p>
                <p className={styles.questionBridge}>became:</p>
                <p>What is underneath the model?</p>
              </div>
              <p>How is it trained? How is it evaluated? What happens when it becomes larger? Where does performance go? How do machines communicate with each other? How do we benchmark a system properly? How do we understand why something failed?</p>
              <p>That curiosity gradually pulled me toward ML systems, infrastructure, evaluation, benchmarking, distributed systems, performance, and software engineering.</p>
              <p>I am also inspired by Andrej Karpathy—not because I know him personally, but because of his curiosity, the way he builds things from first principles, and the way he explains difficult ideas as if they can be understood simply.</p>
            </section>

            <section className={`${styles.readingWidth} ${styles.storySection}`} aria-labelledby="learning-heading">
              <h2 id="learning-heading" className={styles.sectionLabel}>How I learn and build</h2>
              <p>I do not think there is one way to learn everything.</p>
              <p>Depending on what I am trying to understand, I read documentation, watch lectures, read papers, ask questions, build a smaller version myself, experiment, and inspect how existing implementations work.</p>
              <p>The part I enjoy most is understanding the problem deeply.</p>
              <p>Then I like building the first working version, finding what is not working, trying another method, comparing different approaches, debugging, and making the implementation cleaner.</p>
              <p>When I get stuck, I usually keep pushing, but not always in the same direction. Sometimes another approach works better. Sometimes I take a break and come back with a clearer mind.</p>
              <p>The first thing I want after building something is to understand what I actually built.</p>
              <p className={styles.emphasis}>I do not want to build something that I cannot explain to myself.</p>
              <p>A developer should know what the system is doing, how it works, and how the whole process fits together.</p>
            </section>

            <section className={`${styles.readingWidth} ${styles.storySection}`} aria-labelledby="always-heading">
              <h2 id="always-heading" className={styles.sectionLabel}>Always learning</h2>
              <p>I do not think an engineer ever finishes learning.</p>
              <p>Technology changes. Tools change. Systems change. New ideas keep coming.</p>
              <p>There will always be something I do not know and something I can improve.</p>
              <p>For me, engineering is a continuous process:</p>
              <p className={styles.process}>learn → build → test → understand → improve → repeat</p>
              <p>I want to keep getting deeper into ML infrastructure, model-training systems, distributed systems, developer tools for ML, research engineering, and software engineering.</p>
              <p>But I do not want to build technology only because it is technically interesting.</p>
              <p>I want the things I build to be useful to someone.</p>
              <p>That could mean making useful technology accessible to more people, helping developers or researchers work more effectively, making a complex system easier to use, applying technology in healthcare or education, or solving a real everyday problem.</p>
              <p>For me, simply knowing that someone genuinely benefited from something I built would mean a lot.</p>
            </section>

            <section className={`${styles.readingWidth} ${styles.storySection}`} aria-labelledby="beyond-heading">
              <h2 id="beyond-heading" className={styles.sectionLabel}>Beyond engineering</h2>
              <p>I am naturally quiet and introverted, and I like simplicity and being comfortable with myself.</p>
              <p>But with the people I am close to—my family and friends—I can be completely different.</p>
              <p>I can also be impatient. At the same time, I have learned that some situations need patience, and sometimes stepping away and coming back is better than forcing an answer.</p>
              <p>I am ambitious, but I would like that ambition to lead toward something useful—to help other people, to be part of someone&apos;s happiness, and to keep improving without losing balance.</p>
            </section>
          </div>

          <aside className={styles.favorites} aria-labelledby="favorites-heading">
            <h2 id="favorites-heading" className={styles.sectionLabel}>A few favorites</h2>
            <div className={styles.favoritesStack}>
              <div>
                <h3 className={styles.favoriteLabel}>Favorite books</h3>
                <ul className={styles.books}>
                  <li>
                    <a className={styles.bookLink} href="https://vedabase.io/en/library/kb/" target="_blank" rel="noopener noreferrer">
                      <Image
                        className={styles.bookCover}
                        src="/images/about/krsna-book-cover.png"
                        alt="Kṛṣṇa: The Supreme Personality of Godhead book cover"
                        width={320}
                        height={508}
                        sizes="76px"
                      />
                      <span>Kṛṣṇa: The Supreme Personality of Godhead</span>
                    </a>
                  </li>
                  <li>
                    <a className={styles.bookLink} href="https://vedabase.io/en/library/sb/" target="_blank" rel="noopener noreferrer">
                      <Image
                        className={styles.bookCover}
                        src="/images/about/srimad-bhagavatam-book-cover.png"
                        alt="Śrīmad-Bhāgavatam book cover"
                        width={320}
                        height={508}
                        sizes="76px"
                      />
                      <span>Śrīmad-Bhāgavatam</span>
                    </a>
                  </li>
                </ul>
              </div>
              <dl className={styles.favoriteDetails}>
                <div>
                  <dt className={styles.favoriteLabel}>Favorite destination</dt>
                  <dd>
                    <Image
                      className={styles.favoriteThumbnail}
                      src="/images/about/vrindavan-destination.png"
                      alt="Vrindavan"
                      width={450}
                      height={350}
                      sizes="160px"
                    />
                    Vrindavan
                  </dd>
                </div>
                <div>
                  <dt className={styles.favoriteLabel}>Favorite place</dt>
                  <dd>
                    <Image
                      className={styles.favoriteThumbnail}
                      src="/images/about/rajasthan-place.png"
                      alt="Rajasthan"
                      width={1280}
                      height={720}
                      sizes="160px"
                    />
                    Rajasthan
                  </dd>
                </div>
                <div>
                  <dt className={styles.favoriteLabel}>Favorite movies</dt>
                  <dd>
                    <Image
                      className={styles.favoriteThumbnail}
                      src="/images/about/little-krishna-poster.png"
                      alt="Little Krishna poster"
                      width={1600}
                      height={1200}
                      sizes="160px"
                    />
                    <ul className={styles.movies}>
                      <li>Little Krishna</li>
                      <li>Spider-Man</li>
                      <li>Mahavatar Narsimha</li>
                      <li>Superman</li>
                      <li>Marvel’s Avengers</li>
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </article>

      <div className={styles.aboutFooterRule} aria-hidden="true" />
    </main>
  );
}
