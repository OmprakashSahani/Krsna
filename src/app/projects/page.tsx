import type { Metadata } from "next";
import { ProjectIndex } from "@/components/ProjectIndex";

export const metadata: Metadata = {
  title: "Projects",
  description: "A selected index of ML systems, evaluation, performance, search, and robotics-data projects by Omprakash Sahani.",
  alternates: { canonical: "/projects" },
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
