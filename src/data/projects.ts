import { type ProjectSlug } from "./project-details";

export type ProjectPreview =
  | {
      type: "video";
      src: string;
      poster: string;
      label: string;
    }
  | {
      type: "certificate";
      src: string;
      href: string;
      alt: string;
      width: number;
      height: number;
    };

export type Project = {
  title: string;
  area: string;
  description: string;
  slug?: ProjectSlug;
  repository?: string;
  liveDemo?: string;
  preview?: ProjectPreview;
};

export const projects: readonly Project[] = [
  {
    title: "Atlas AI",
    area: "ML infrastructure",
    description:
      "ML systems platform for transformers, distributed runtime, inference serving, benchmarking, and observability.",
    repository: "https://github.com/OmprakashSahani/atlas-ai",
  },
  {
    title: "EvidencePatch",
    area: "Software evidence",
    description: "Governed evidence-to-code workflow with deterministic provenance verification.",
    slug: "evidencepatch",
    repository: "https://github.com/OmprakashSahani/evidencepatch",
    preview: {
      type: "certificate",
      src: "/images/projects/evidencepatch/micro1-frontier-engineering-challenge-certificate.png",
      href: "/documents/projects/evidencepatch/micro1-frontier-engineering-challenge-certificate.pdf",
      alt: "micro1 Frontier Engineering Challenge 2026 Certificate of Participation for Omprakash Sahani",
      width: 2040,
      height: 1332,
    },
  },
  {
    title: "Codex Benchmark Guardian",
    area: "Benchmark engineering",
    description:
      "Benchmark regression and repair workflow for pull requests with deterministic analysis, FastAPI/Next.js tooling, protected verification, and human approval.",
    repository: "https://github.com/OmprakashSahani/codex-benchmark-guardian",
    liveDemo: "https://codex-benchmark-guardian.vercel.app",
    preview: {
      type: "video",
      src: "/videos/projects/codex-benchmark-guardian/demo.mp4",
      poster: "/images/projects/codex-benchmark-guardian-demo.webp",
      label: "Codex Benchmark Guardian OpenAI Build Week demo",
    },
  },
  {
    title: "ThermalShift AI",
    area: "GPU scheduling",
    description:
      "Thermal-aware GPU scheduler using FortyGuard data and OR-Tools CP-SAT; reduced modeled thermal exposure by 20.1% vs. First Available in the summer historical replay while preserving 100% deadline satisfaction.",
    repository: "https://github.com/OmprakashSahani/thermalshift-ai",
    liveDemo: "https://thermalshift-ai.onrender.com/",
    preview: {
      type: "certificate",
      src: "/images/projects/thermalshift-ai/fortyguard-hackathon-certificate.webp",
      href: "/documents/projects/thermalshift-ai/fortyguard-hackathon-certificate.jpg",
      alt: "FortyGuard Hackathon 2026 certificate for Omprakash Sahani",
      width: 1600,
      height: 1132,
    },
  },
  {
    title: "SearchEval Lab",
    area: "Search evaluation",
    description:
      "Search evaluation framework for TF-IDF, BM25, hybrid retrieval, ranking metrics, weak-query analysis, and regression checks.",
    slug: "searcheval-lab",
    repository: "https://github.com/OmprakashSahani/searcheval-lab",
  },
  {
    title: "LeRobot State Atlas",
    area: "Robotics data systems",
    description:
      "Dual-arm LeRobot dataset analysis using URDF-based forward kinematics, tool trajectories, voxelized workspace coverage, and Gaussian Splat environment reconstruction.",
    slug: "lerobot-state-atlas",
    repository: "https://github.com/OmprakashSahani/lerobot-state-atlas",
    preview: {
      type: "video",
      src: "/videos/projects/lerobot-state-atlas/gaussian-splat-demo.mp4",
      poster: "/images/projects/lerobot-workspace.jpg",
      label: "Gaussian Splat workspace reconstruction demo",
    },
  },
] as const;
