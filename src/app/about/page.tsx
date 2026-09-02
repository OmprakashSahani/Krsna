import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Omprakash Sahani and his work across ML systems, software engineering, distributed systems, and evaluation.",
};

const focus = ["ML systems", "Software engineering", "Distributed systems", "Evaluation and benchmarking"];

export default function AboutPage() {
  return (
    <main id="main-content" className="inner-page about-page">
      <section className="page-intro" aria-labelledby="about-heading">
        <p className="section-label">About</p>
        <h1 id="about-heading">Omprakash Sahani</h1>
        <div className="about-copy">
          <p>Omprakash is a computer science graduate building machine learning systems and supporting software. His work examines how memory, communication, latency, observability, and reproducibility shape system behavior in practice.</p>
          <p>He develops independent, documented projects across ML infrastructure, performance evaluation, search, distributed computation, and robotics data. The approach is to make behavior measurable, keep claims tied to evidence, and turn systems questions into usable tools.</p>
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-focus">
        <p className="section-label">Focus</p>
        <h2 id="about-focus" className="sr-only">Focus</h2>
        <ul>{focus.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section className="about-section education" aria-labelledby="education-heading">
        <p className="section-label">Education</p>
        <h2 id="education-heading" className="sr-only">Education</h2>
        <article>
          <time>2017–2020</time>
          <div><h3>Diploma in Computer Engineering</h3><p>Maharashtra State Board of Technical Education</p></div>
        </article>
        <article>
          <time>2020–2023</time>
          <div><h3>Bachelor of Technology in Computer Science and Engineering</h3><p>Sanjay Ghodawat University</p></div>
        </article>
      </section>
    </main>
  );
}
