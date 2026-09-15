import type { Metadata } from "next";
import {
  ProjectExternalLink,
  ProjectIntro,
  ProjectPageHeader,
  ProjectRailSection,
  ProjectStorySection,
  ProjectTrace,
} from "@/components/projects/ProjectPage";
import styles from "@/components/projects/project-page.module.css";
import localStyles from "./searcheval-lab.module.css";

const description = "Search evaluation and benchmarking infrastructure with lexical retrieval baselines, ranking metrics, latency tracking, saved artifacts, and regression comparison.";

export const metadata: Metadata = {
  title: "SearchEval Lab",
  description,
  alternates: { canonical: "/projects/searcheval-lab" },
  openGraph: { type: "website", title: "SearchEval Lab — Omprakash Sahani", description, siteName: "Omprakash Sahani" },
  twitter: { card: "summary", title: "SearchEval Lab — Omprakash Sahani", description },
};

const workflow = [
  "Dataset",
  "Validation",
  "Search Method",
  "Top-K Results",
  "Ranking Metrics",
  "Benchmark Run",
  "Saved Artifacts",
  "Report",
  "Weak Query Analysis",
  "Regression Comparison",
];

export default function SearchEvalLabPage() {
  return (
    <main id="main-content" className={styles.projectPage}>
      <ProjectPageHeader title="SearchEval Lab" backHref="/" backLabel="Return to homepage" />

      <article className={styles.projectComposition} aria-labelledby="project-title">
        <ProjectIntro
          headingId="project-title"
          eyebrow="Project / Search Evaluation"
          title="SearchEval Lab"
          subtitle="Search Quality Evaluation Infrastructure"
        >
          <p>SearchEval Lab is an ML systems and backend project for measuring, comparing, and protecting the quality of search and retrieval systems.</p>
          <p>It turns retrieval methods into reproducible benchmark runs with ranking metrics, latency measurements, failure analysis, saved artifacts, and regression checks.</p>
        </ProjectIntro>

        <div className={localStyles.story}>
          <ProjectStorySection headingId="overview-heading" title="Overview">
            <p>SearchEval Lab is evaluation and benchmarking infrastructure for search and retrieval systems. It provides a repeatable workflow for running retrieval methods against labelled benchmark queries and measuring how well relevant documents are ranked.</p>
          </ProjectStorySection>

          <ProjectStorySection headingId="problem-heading" title="The Problem">
            <p>Search systems change frequently. Without a stable evaluation layer, it is difficult to know whether a new retrieval method helped, which queries became worse, or whether relevant documents moved into the top results. Quality improvements can also come with unacceptable latency changes.</p>
            <p>The goal is to answer those questions through reproducible benchmark runs rather than subjective spot checks.</p>
          </ProjectStorySection>

          <ProjectStorySection headingId="approach-heading" title="Approach">
            <p>The workflow starts with JSONL documents, queries, and qrels: relevance labels connecting queries to documents. Dataset loading validates the schema, and further checks catch duplicate identifiers, missing references, and empty datasets.</p>
            <p>A common search-engine interface supports TF-IDF, BM25, and hybrid BM25 + TF-IDF retrieval. The hybrid method combines normalized lexical scores. Each method returns top-K results for evaluation with Precision@K, Recall@K, MRR@K, and NDCG@K, alongside query latency measurements.</p>
            <p>Benchmark runs store aggregate and per-query metrics with latency artifacts. Markdown reports surface weak queries, and saved runs can be compared using configurable thresholds for quality drops and latency increases.</p>
          </ProjectStorySection>

          <ProjectStorySection headingId="built-heading" title="What I Built">
            <p>I implemented the dataset schema, loading, and validation workflow; TF-IDF, BM25, and hybrid retrieval; and the shared search-engine interface and factory. I built the ranking metrics, evaluator, and benchmark runner that turn query results into saved run artifacts.</p>
            <p>I added Markdown reports, weak-query analysis, regression configuration and detection, and CLI workflows for running and comparing benchmarks. A FastAPI backend exposes validation, benchmark execution, saved results, and run comparison through HTTP. Makefile commands, example scripts, automated tests, and GitHub Actions CI support the development workflow.</p>
          </ProjectStorySection>

          <ProjectStorySection headingId="evaluation-heading" title="Evaluation">
            <p>Example BM25 output from the repository&apos;s sample benchmark.</p>
            <dl className={styles.metrics}>
              <div><dt>Precision@10</dt><dd>0.1900</dd></div>
              <div><dt>Recall@10</dt><dd>1.0000</dd></div>
              <div><dt>MRR@10</dt><dd>0.9500</dd></div>
              <div><dt>NDCG@10</dt><dd>0.9198</dd></div>
            </dl>
            <p>The documented TF-IDF → BM25 sample comparison reports:</p>
            <dl className={localStyles.comparison}>
              <div><dt>Precision@10</dt><dd>+0.0100</dd></div>
              <div><dt>Recall@10</dt><dd>+0.0500</dd></div>
              <div><dt>NDCG@10</dt><dd>+0.0085</dd></div>
            </dl>
            <p className={localStyles.note}>These sample benchmark results are illustrative and dataset-dependent. They are not production search-quality claims.</p>
          </ProjectStorySection>

          <ProjectStorySection headingId="system-workflow-heading" title="System Workflow">
            <ol className={localStyles.systemWorkflow} role="list">
              {workflow.map((step, index) => (
                <li key={step}>
                  {index > 0 && <span aria-hidden="true">→</span>}
                  {step}
                </li>
              ))}
            </ol>
          </ProjectStorySection>

          <ProjectStorySection headingId="capabilities-heading" title="Current Capabilities">
            <p>The system supports CLI and FastAPI HTTP workflows for dataset validation, benchmark execution, and comparison of saved runs. Stored metrics, latency results, and reports make individual runs inspectable. Configurable regression thresholds compare both retrieval quality and latency against a baseline.</p>
          </ProjectStorySection>

          <ProjectStorySection headingId="boundaries-heading" title="Boundaries">
            <p>The included retrieval methods are lexical and hybrid lexical baselines. The bundled benchmark dataset is small and illustrative. Scores depend on the dataset, qrels and their relevance labels, K, and engine configuration; the sample results are not production claims.</p>
            <p>Embedding-based and vector retrieval are not implemented in the current system.</p>
          </ProjectStorySection>
        </div>

        <div className={localStyles.details}>
          <ProjectTrace />

          <aside className={localStyles.metadata} aria-label="Project facts">
            <ProjectRailSection headingId="links-heading" title="Links" className={localStyles.metadataSection}>
              <div className={styles.projectLinks}>
                <ProjectExternalLink href="https://github.com/OmprakashSahani/searcheval-lab">GitHub Repository</ProjectExternalLink>
              </div>
            </ProjectRailSection>

            <ProjectRailSection headingId="facts-heading" title="Project" className={localStyles.metadataSection}>
              <dl className={styles.facts}>
                <div><dt>Area</dt><dd>Search Evaluation · ML Systems</dd></div>
                <div><dt>Status</dt><dd>Active development</dd></div>
                <div><dt>License</dt><dd>MIT</dd></div>
              </dl>
            </ProjectRailSection>

            <ProjectRailSection headingId="features-heading" title="Features" className={localStyles.metadataSection}>
              <ul className={styles.railList}>
                <li>Dataset validation</li>
                <li>TF-IDF retrieval</li>
                <li>BM25 retrieval</li>
                <li>Hybrid retrieval</li>
                <li>Ranking metrics</li>
                <li>Latency tracking</li>
                <li>Weak-query analysis</li>
                <li>Regression detection</li>
                <li>FastAPI workflows</li>
              </ul>
            </ProjectRailSection>

            <ProjectRailSection headingId="tools-heading" title="Tools" className={`${localStyles.metadataSection} ${localStyles.tools}`}>
              <div className={`${styles.toolGroups} ${localStyles.toolColumns}`}>
                <div>
                  <h3 className={styles.railLabel}>Core</h3>
                  <ul className={styles.railList}><li>Python</li><li>NumPy</li><li>scikit-learn</li><li>Pydantic</li></ul>
                </div>
                <div>
                  <h3 className={styles.railLabel}>Interface</h3>
                  <ul className={styles.railList}><li>Typer</li><li>Rich</li><li>FastAPI</li><li>Uvicorn</li></ul>
                </div>
                <div>
                  <h3 className={styles.railLabel}>Quality</h3>
                  <ul className={styles.railList}><li>Pytest</li><li>Ruff</li><li>GitHub Actions</li></ul>
                </div>
              </div>
            </ProjectRailSection>

            <ProjectRailSection headingId="development-heading" title="Development Workflow" className={localStyles.metadataSection}>
              <p className={localStyles.note}>AI-assisted development, with automated tests and CI checks.</p>
            </ProjectRailSection>

            <ProjectRailSection headingId="author-heading" title="Built By" className={`${localStyles.metadataSection} ${localStyles.provenance}`}>
              <p><strong>Omprakash Sahani</strong></p>
              <p className={localStyles.note}>Independent project</p>
            </ProjectRailSection>

            <ProjectRailSection headingId="inspiration-heading" title="Inspired By" className={`${localStyles.metadataSection} ${localStyles.provenance}`}>
              <p>Exa</p>
              <p className={localStyles.note}><strong>Will Bryk</strong>, CEO of Exa</p>
            </ProjectRailSection>
          </aside>
        </div>
      </article>

      <div className={styles.footerRule} />
    </main>
  );
}
