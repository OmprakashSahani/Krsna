import { type ProjectSlug } from "./project-details";

export type Project = {
  title: string;
  area: string;
  description: string;
  slug?: ProjectSlug;
  repository?: string;
};

export const projects: readonly Project[] = [
  {
    title: "Atlas AI",
    area: "ML infrastructure",
    description:
      "ML systems for transformer training, inference, observability, and evaluation.",
    repository: "https://github.com/OmprakashSahani/atlas-ai",
  },
  {
    title: "EvidencePatch",
    area: "Software evidence",
    description: "Evidence-aware software change decisions.",
    slug: "evidencepatch",
    repository: "https://github.com/OmprakashSahani/evidencepatch",
  },
  {
    title: "SearchEval Lab",
    area: "Search evaluation",
    description:
      "Retrieval evaluation and regression analysis across relevance, latency, and query-level failures.",
    slug: "searcheval-lab",
    repository: "https://github.com/OmprakashSahani/searcheval-lab",
  },
  {
    title: "LeRobot State Atlas",
    area: "Robotics data systems",
    description:
      "Robotics dataset diagnostics, dual-arm trajectory playback, and workspace coverage.",
    slug: "lerobot-state-atlas",
    repository: "https://github.com/OmprakashSahani/lerobot-state-atlas",
  },
] as const;
