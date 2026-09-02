export type Project = {
  number: string;
  title: string;
  area: string;
  description: string;
  repository?: string;
};

export const projects: readonly Project[] = [
  {
    number: "01",
    title: "Atlas AI",
    area: "ML infrastructure",
    description:
      "ML systems for transformer training, inference, observability, and evaluation.",
    repository: "https://github.com/OmprakashSahani/atlas-ai",
  },
  {
    number: "02",
    title: "Codex Benchmark Guardian",
    area: "Performance repair",
    description: "Benchmark-gated repair for performance regressions.",
    repository: "https://github.com/OmprakashSahani/codex-benchmark-guardian",
  },
  {
    number: "03",
    title: "EvidencePatch",
    area: "Software evidence",
    description: "Evidence-aware software change decisions.",
    repository: "https://github.com/OmprakashSahani/evidencepatch",
  },
  {
    number: "04",
    title: "SearchEval Lab",
    area: "Search evaluation",
    description:
      "Retrieval evaluation and regression analysis across relevance, latency, and query-level failures.",
    repository: "https://github.com/OmprakashSahani/searcheval-lab",
  },
  {
    number: "05",
    title: "LeRobot State Atlas",
    area: "Robotics data systems",
    description:
      "Robotics dataset diagnostics, dual-arm trajectory playback, and workspace coverage.",
    repository: "https://github.com/OmprakashSahani/lerobot-state-atlas",
  },
] as const;
