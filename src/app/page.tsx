import type { Metadata } from "next";
import { NameReveal } from "@/components/NameReveal";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main id="main-content">
      <section id="top" className="identity" aria-label="Introduction">
        <NameReveal />

        <div className="content-grid">
          <div className="introduction">
            <p>I&apos;m Omprakash Sahani. I&apos;m a software engineer interested in machine learning and the systems behind it. I like understanding how things actually work — how models are evaluated, why performance changes, what happens inside distributed systems, how search quality is measured, and how data affects what a robot can learn.</p>
            <p>I started with a Diploma in Computer Engineering and later completed my B.Tech in Computer Science and Engineering. A lot of my learning has also come from building projects on my own. When something interests me, I like going deeper into it, building something practical, measuring how it behaves, finding where it fails, and then trying to improve it. That is what led me toward ML systems, search evaluation, distributed systems, and robot learning.</p>
            <p>I care about building software that is not only technically interesting, but useful in the real world. I think good engineering should help people, make difficult things easier to understand, and solve meaningful problems. I still have a lot to learn, and that is something I genuinely enjoy. I want to keep learning, building, and using what I learn to create systems that are reliable, understandable, and helpful to others.</p>
          </div>

          <aside className="sidebar" aria-label="Current work and research interests">
            <section aria-labelledby="current-work-heading">
              <h2 id="current-work-heading" className="section-label">Current work</h2>
              <ul className="sidebar-list">
                <li><a href="https://github.com/OmprakashSahani/lerobot-state-atlas" target="_blank" rel="noopener noreferrer">LeRobot State Atlas<span className="sr-only"> (opens in a new tab)</span></a></li>
                <li><a href="https://github.com/OmprakashSahani/searcheval-lab" target="_blank" rel="noopener noreferrer">SearchEval Lab<span className="sr-only"> (opens in a new tab)</span></a></li>
                <li><a href="https://github.com/OmprakashSahani/evidencepatch" target="_blank" rel="noopener noreferrer">EvidencePatch<span className="sr-only"> (opens in a new tab)</span></a></li>
                <li><a href="https://github.com/OmprakashSahani/atlas-ai" target="_blank" rel="noopener noreferrer">Atlas AI<span className="sr-only"> (opens in a new tab)</span></a></li>
              </ul>
            </section>

            <section className="research-section" aria-labelledby="research-heading">
              <h2 id="research-heading" className="section-label">Research interest</h2>
              <ul className="sidebar-list">
                <li>ML Systems</li>
                <li>Robot Learning</li>
                <li>AI Evaluation</li>
                <li>Distributed Systems</li>
              </ul>
            </section>

            <section className="writing-section" aria-labelledby="writing-heading">
              <h2 id="writing-heading" className="section-label">Writing</h2>
              <p className="writing-status">Coming soon</p>
            </section>
          </aside>
        </div>
      </section>

      <nav className="professional-links" aria-label="Professional links">
        <a href="https://github.com/OmprakashSahani" target="_blank" rel="noopener noreferrer">GitHub<span className="sr-only"> (opens in a new tab)</span></a>
        <a href="https://www.linkedin.com/in/omprakashsahani/" target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
        <Link href="/resume">Resume</Link>
        <a href="mailto:Omprakash.Sahani1206@gmail.com">Email</a>
      </nav>
    </main>
  );
}
