import type { Metadata } from "next";
import Image from "next/image";
import {
  ProjectExternalLink,
  ProjectIntro,
  ProjectPageHeader,
  ProjectRailSection,
  ProjectStorySection,
} from "@/components/projects/ProjectPage";
import styles from "@/components/projects/project-page.module.css";
import localStyles from "./evidencepatch.module.css";

const description = "Evidence-governance and verification infrastructure for clinical-software maintenance, with deterministic dispositions, repository impact analysis, and provenance checks.";

export const metadata: Metadata = {
  title: "EvidencePatch",
  description,
  alternates: { canonical: "/projects/evidencepatch" },
  openGraph: { type: "website", title: "EvidencePatch — Omprakash Sahani", description, siteName: "Omprakash Sahani" },
  twitter: { card: "summary", title: "EvidencePatch — Omprakash Sahani", description },
};

export default function EvidencePatchPage() {
  return (
    <main id="main-content" className={styles.projectPage}>
      <ProjectPageHeader title="EvidencePatch" backHref="/" backLabel="Return to homepage" />

      <article className={styles.projectComposition} aria-labelledby="project-title">
        <div className={localStyles.introLayout}>
          <ProjectIntro
            headingId="project-title"
            eyebrow="Project / Evidence Governance"
            title="EvidencePatch"
            subtitle="Evidence-Governed Clinical Software Maintenance"
          >
            <p>EvidencePatch is an AI-systems project for governing evidence-backed maintenance of clinical-informatics and healthcare software.</p>
            <p>It separates evidence interpretation, authority judgment, software-change authorization, repository impact, and provenance verification instead of collapsing them into one generative step.</p>
          </ProjectIntro>

          <figure className={localStyles.certificate}>
            <a
              className={localStyles.certificateLink}
              href="/documents/projects/evidencepatch/micro1-frontier-engineering-challenge-certificate.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-labelledby="certificate-link-label"
            >
              <Image
                src="/images/projects/evidencepatch/micro1-frontier-engineering-challenge-certificate.png"
                alt="micro1 Frontier Engineering Challenge 2026 Certificate of Participation for Omprakash Sahani"
                width={2040}
                height={1332}
                sizes="(max-width: 1080px) 320px, 30vw"
              />
              <span id="certificate-link-label" className="sr-only">View micro1 Frontier Engineering Challenge certificate (PDF) (opens in a new tab)</span>
            </a>
            <figcaption>micro1 · Frontier Engineering Challenge 2026</figcaption>
          </figure>
        </div>

        <div className={styles.bodyGrid} data-trace="left">
          <aside className={styles.projectRail} data-trace="left" aria-label="Project facts">
            <ProjectRailSection headingId="challenge-heading" title="Challenge" trace="left" className={localStyles.provenance}>
              <p>EvidencePatch was part of the <strong>micro1 Frontier Engineering Challenge 2026</strong>.</p>
              <p className={localStyles.note}>Certificate of Participation</p>
            </ProjectRailSection>

            <ProjectRailSection headingId="links-heading" title="Links" trace="left">
              <div className={styles.projectLinks}>
                <ProjectExternalLink href="https://github.com/OmprakashSahani/evidencepatch">GitHub Repository</ProjectExternalLink>
                <ProjectExternalLink href="https://github.com/OmprakashSahani/evidencepatch/blob/main/docs/public_mcp_demo.md">Public MCP Demo</ProjectExternalLink>
              </div>
            </ProjectRailSection>

            <ProjectRailSection headingId="facts-heading" title="Project" trace="left">
              <dl className={styles.facts}>
                <div><dt>Area</dt><dd>Clinical Informatics · AI Systems</dd></div>
                <div><dt>Status</dt><dd>Research prototype</dd></div>
              </dl>
            </ProjectRailSection>

            <ProjectRailSection headingId="features-heading" title="Features" trace="left">
              <ul className={styles.railList} role="list">
                <li>Clinical Change Contract</li>
                <li>Deterministic governance</li>
                <li>PATCH / NO_PATCH / ESCALATE</li>
                <li>Repository impact analysis</li>
                <li>Provenance verification</li>
                <li>Human-review boundaries</li>
                <li>MCP governance surface</li>
                <li>Synthetic benchmark evaluator</li>
              </ul>
            </ProjectRailSection>

            <ProjectRailSection headingId="tools-heading" title="Tools" trace="left">
              <div className={`${styles.toolGroups} ${localStyles.toolColumns}`}>
                <div>
                  <h3 className={styles.railLabel}>Core</h3>
                  <ul className={styles.railList} role="list"><li>Python</li><li>MCP SDK</li></ul>
                </div>
                <div>
                  <h3 className={styles.railLabel}>Agent / Discovery</h3>
                  <ul className={styles.railList} role="list"><li>OpenAI Codex CLI</li><li>Exa MCP</li></ul>
                </div>
                <div>
                  <h3 className={styles.railLabel}>Quality / Evaluation</h3>
                  <ul className={styles.railList} role="list"><li>Pytest</li></ul>
                </div>
              </div>
            </ProjectRailSection>

            <ProjectRailSection headingId="stack-heading" title="Agent Stack" trace="left">
              <dl className={styles.facts}>
                <div><dt>Codex</dt><dd>gpt-5.6-sol</dd></div>
                <div><dt>Exa MCP</dt><dd>Public evidence discovery</dd></div>
                <div><dt>EvidencePatch MCP</dt><dd>Governance + verification</dd></div>
              </dl>
            </ProjectRailSection>

            <ProjectRailSection headingId="author-heading" title="Built By" trace="left" className={localStyles.provenance}>
              <p><strong>Omprakash Sahani</strong></p>
              <p className={localStyles.note}>Independent project</p>
            </ProjectRailSection>
          </aside>

          <div className={`${styles.narrative} ${localStyles.story}`}>
            <ProjectStorySection headingId="overview-heading" title="Overview">
              <p>EvidencePatch focuses on evidence-backed maintenance of executable clinical-informatics and healthcare-software rules. Newer or credible evidence does not automatically authorize a software behavior change.</p>
              <p>The system makes authority, recency, change pressure, governance, and verification explicit so a proposed update can be examined as a software-maintenance decision.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="problem-heading" title="The Problem">
              <p>A new medical study can be important without superseding the regulator or guideline that currently controls executable software behavior.</p>
              <p>A naive evidence-to-code workflow can collapse evidence interpretation, authority judgment, action selection, implementation, and verification into one generative decision. That makes consequential software maintenance harder to audit and govern.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="principle-heading" title="Design Principle">
              <p>Fresh medical evidence is not automatically actionable medical evidence.</p>
              <p>Recency, publication, authority, and executable change pressure are separate properties. A newer non-authoritative study may create meaningful review pressure without changing the currently controlling executable rule.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="architecture-heading" title="Architecture">
              <p>In the measured workflow, Codex reads a public synthetic task containing evidence and a repository, then proposes a Clinical Change Contract. Deterministic governance selects the final disposition: PATCH, NO_PATCH, or ESCALATE.</p>
              <p>Only PATCH authorizes a separate Codex patch stage. Every path produces a deterministic result, followed by static provenance checks and a hidden behavior test. These checks determine Verified Update Success Rate: the share of cases that pass every check.</p>
              <p>The product MCP surface has a separate boundary. Exa MCP discovers and fetches public evidence; the host or agent proposes a structured interpretation. EvidencePatch MCP supplies governance, repository-impact analysis, and provenance verification through exactly three tools:</p>
              <ul className={`${styles.railList} ${localStyles.mcpTools}`} role="list">
                <li><code>assess_change_contract</code></li>
                <li><code>analyze_repository_impact</code></li>
                <li><code>verify_result_provenance</code></li>
              </ul>
              <p>Codex handles semantic interpretation and authorized implementation. Deterministic governance selects the final disposition. EvidencePatch MCP is governance and verification infrastructure, not a coding agent.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="built-heading" title="What I Built">
              <p>I implemented the Clinical Change Contract, deterministic governance gate, and PATCH / NO_PATCH / ESCALATE taxonomy with explicit human-review boundaries. I built the isolated agent workflow, synthetic benchmark and evaluation harness, and comparison workflow.</p>
              <p>I added repository-impact analysis, provenance verification, the EvidencePatch MCP server, a public MCP demonstration, and official artifact and reproducibility documentation. OpenAI Codex CLI, Exa MCP, the MCP SDK, and Python ecosystem dependencies are external components.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="result-heading" title="Measured Result">
              <p>The official benchmark used gpt-5.6-sol on 12 synthetic medication-safety / clinical-software maintenance cases. Verified Update Success Rate requires every check to pass.</p>
              <dl className={`${styles.metrics} ${localStyles.resultMetrics}`}>
                <div><dt>Plain Codex · 11 / 12 verified</dt><dd>91.67%</dd></div>
                <div><dt>EvidencePatch advanced · 12 / 12 verified</dt><dd>100.00%</dd></div>
                <div><dt>Measured delta · percentage points</dt><dd>+8.33</dd></div>
              </dl>
              <dl className={`${styles.metrics} ${localStyles.computeMetrics}`}>
                <div><dt>Codex calls · 12 → 21</dt><dd>1.75×</dd></div>
                <div><dt>Solver duration · 595.405 → 1090.656 seconds</dt><dd>1.83×</dd></div>
              </dl>
              <p className={localStyles.note}>This is a reliability-versus-compute result, not an equal-inference-budget comparison. It is not a claim of statistical significance or evidence of clinical safety. The 100.00% result describes these 12 synthetic cases; it does not establish universal correctness.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="failure-heading" title="Main Failure Mode">
              <p>The plain-Codex baseline&apos;s only complete-case failure was <code>action_correct</code>. The public artifact does not retain the submitted action, so the wrong action is not inferred or reconstructed.</p>
              <p>The design lesson is that generation and governance should not necessarily be the same responsibility. This result does not imply that the baseline misunderstood the underlying medical evidence.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="demo-heading" title="Public Evidence Demo">
              <p>In the published software-maintenance demonstration, a current authoritative source and later observational evidence played different evidence roles. EvidencePatch returned ESCALATE: human review was required while the disposable synthetic repository remained unchanged and all five provenance checks passed.</p>
              <p>The Public MCP Demo linked in the project rail documents this boundary. It is a software-maintenance disposition, not medical advice.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="boundaries-heading" title="Boundaries">
              <p>The measured benchmark is synthetic. The public MCP demo uses public evidence and a disposable synthetic repository. Benchmark performance does not establish clinical safety.</p>
              <p>EvidencePatch does not make clinical decisions. Outputs are not medical advice. PATCH does not mean deployment permission; PATCH and ESCALATE require human review.</p>
              <p>EvidencePatch MCP does not search the web, call Exa or Codex, modify repositories, deploy software, or read benchmark ground truth.</p>
            </ProjectStorySection>
          </div>
        </div>
      </article>

      <div className={styles.footerRule} />
    </main>
  );
}
