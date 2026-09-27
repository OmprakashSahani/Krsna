import type { Metadata } from "next";

// The original case-study metadata wording, shared by canonical panel URLs.
export const projectDetails = {
  "lerobot-state-atlas": { title: "LeRobot State Atlas", description: "Robot workspace intelligence: an editorial account of LeRobot dataset analysis, forward kinematics, spatial coverage, and ongoing environment reconstruction work." },
  "searcheval-lab": { title: "SearchEval Lab", description: "Search evaluation and benchmarking infrastructure with lexical retrieval baselines, ranking metrics, latency tracking, saved artifacts, and regression comparison." },
  "evidencepatch": { title: "EvidencePatch", description: "Evidence-governance and verification infrastructure for clinical-software maintenance, with deterministic dispositions, repository impact analysis, and provenance checks." },
} as const;

export type ProjectSlug = keyof typeof projectDetails;

export function isProjectSlug(value: unknown): value is ProjectSlug {
  return typeof value === "string" && Object.hasOwn(projectDetails, value);
}

export function projectHref(slug: ProjectSlug) {
  return `/?panel=work&project=${slug}`;
}

export function projectMetadata(slug: ProjectSlug): Metadata {
  const { title, description } = projectDetails[slug];
  const socialTitle = `${title} — Omprakash Sahani`;
  return {
    title,
    description,
    alternates: { canonical: projectHref(slug) },
    openGraph: { type: "website", title: socialTitle, description, siteName: "Omprakash Sahani" },
    twitter: { card: "summary", title: socialTitle, description },
  };
}
