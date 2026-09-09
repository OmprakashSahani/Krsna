import type { Metadata } from "next";
import { ProjectIndex } from "@/components/ProjectIndex";

const description = "A selected index of ML systems, evaluation, performance, search, and robotics-data projects by Omprakash Sahani.";

export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: { canonical: "/projects" },
  openGraph: { type: "website", title: "Projects — Omprakash Sahani", description, siteName: "Omprakash Sahani" },
  twitter: { card: "summary", title: "Projects — Omprakash Sahani", description },
};

export default function ProjectsPage() {
  return (
    <main id="main-content" className="inner-page">
      <header className="page-intro">
        <p className="section-label">Index / 01—05</p>
        <h1>Selected projects</h1>
        <p>Five systems selected for the questions they examine and the engineering evidence they produce. Detailed case studies will follow.</p>
      </header>
      <ProjectIndex />
    </main>
  );
}
