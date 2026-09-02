export type ResumeTextItem = {
  text: string;
};

export type ResumeContact = {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

export type ResumePersonal = {
  name: string;
  positioning: string;
  location: string;
};

export type ResumeExperience = {
  title: string;
  date: string;
  bullets: readonly ResumeTextItem[];
};

export type ResumeProject = {
  name: string;
  subtitle?: string;
  topics: readonly string[];
  repository?: string;
  bullets: readonly ResumeTextItem[];
};

export type ResumeEducation = {
  institution: string;
  qualification: string;
  field?: string;
  location: string;
  date: string;
  details: readonly string[];
};

export type ResumeSkillCategory = {
  category: string;
  skills: readonly string[];
};

export type ResumeData = {
  personal: ResumePersonal;
  contacts: readonly ResumeContact[];
  summary: readonly ResumeTextItem[];
  experience: readonly ResumeExperience[];
  projects: readonly ResumeProject[];
  education: readonly ResumeEducation[];
  skills: readonly ResumeSkillCategory[];
  researchInterests: readonly ResumeTextItem[];
};

export const resume = {
  personal: {
    name: "Omprakash Sahani",
    positioning: "Software Engineer · ML Systems · Distributed Systems",
    location: "Kolhapur, Maharashtra, India",
  },
  contacts: [
    { label: "Email", value: "Omprakash.Sahani1206@gmail.com", href: "mailto:Omprakash.Sahani1206@gmail.com" },
    { label: "Phone", value: "+91 9561445156", href: "tel:+919561445156" },
    { label: "GitHub", value: "github.com/OmprakashSahani", href: "https://github.com/OmprakashSahani", external: true },
    { label: "LinkedIn", value: "linkedin.com/in/omprakashsahani", href: "https://www.linkedin.com/in/omprakashsahani/", external: true },
  ] satisfies readonly ResumeContact[],
  summary: [
    {
      text: "I'm a software engineer interested in machine learning and the systems behind it. I like understanding how models are evaluated, why performance changes, what happens inside distributed systems, how search quality is measured, and how data affects what a robot can learn.",
    },
    {
      text: "Most of my learning comes from building projects on my own. When something interests me, I like going deeper into it, building something practical, measuring how it behaves, finding where it fails, and then trying to improve it. That is what has led me toward ML systems, robot learning, search evaluation, and distributed systems.",
    },
  ] satisfies readonly ResumeTextItem[],
  experience: [
    {
      title: "ML Systems Engineering Projects — Independent",
      date: "May 2024 – Present",
      bullets: [
        { text: "Built independent projects around ML systems, distributed training, search evaluation, robotics data, benchmarking, and software reliability." },
        { text: "Worked on tools for measuring performance, finding regressions, evaluating retrieval quality, inspecting robot-learning datasets, and understanding distributed-system behavior." },
        { text: "Built command-line tools, APIs, tests, benchmark workflows, documentation, and reproducible examples so I could understand the systems better and make the results easier to inspect." },
      ],
    },
  ] satisfies readonly ResumeExperience[],
  projects: [
    {
      name: "LeRobot State Atlas",
      subtitle: "Robotics Dataset Diagnostics",
      topics: ["Python", "Robot Learning", "Robotics Data", "Kinematics", "Visualization"],
      repository: "https://github.com/OmprakashSahani/lerobot-state-atlas",
      bullets: [
        { text: "Built a tool for exploring state trajectories and workspace coverage in robot-learning datasets." },
        { text: "Added trajectory playback and spatial analysis for dual-arm robot data, including voxelized views of workspace coverage." },
        { text: "Used the project to inspect dataset variation, state-space coverage, reset behavior, and other patterns that may affect what a robot can learn from the data." },
        { text: "Added forward-kinematics and visualization workflows so dataset behavior is easier to understand before training policies." },
      ],
    },
    {
      name: "EvidencePatch",
      subtitle: "Evidence-backed clinical software maintenance",
      topics: ["Python", "MCP", "Clinical Informatics", "Evidence Evaluation", "Software Reliability", "AI Evaluation"],
      repository: "https://github.com/OmprakashSahani/evidencepatch",
      bullets: [
        { text: "Built EvidencePatch to explore how clinical software should respond when new medical evidence appears but does not necessarily replace the rule that currently controls software behavior." },
        { text: "Added a Clinical Change Contract and deterministic PATCH, NO_PATCH, and ESCALATE decisions so evidence interpretation and code generation do not decide the final maintenance action by themselves." },
        { text: "Added MCP tools for assessing change contracts, analyzing repository impact, and checking whether the final result can be traced back to the evidence that justified it. PATCH and ESCALATE require human review." },
      ],
    },
    {
      name: "Atlas AI",
      subtitle: "Open ML Systems Platform",
      topics: ["Python", "PyTorch", "Transformers", "ML Systems", "Distributed Systems", "Benchmarking"],
      repository: "https://github.com/OmprakashSahani/atlas-ai",
      bullets: [
        { text: "Built an open ML systems project to explore training infrastructure, transformer systems, distributed runtime ideas, inference, observability, benchmarking, and performance analysis." },
        { text: "Implemented autograd-based training workflows, transformer components, profiling utilities, and reproducible experiments." },
        { text: "Used the project to study communication behavior, memory usage, training and inference workflows, and the systems trade-offs behind modern ML workloads." },
      ],
    },
    {
      name: "SearchEval Lab",
      subtitle: "Search & Retrieval Evaluation Infrastructure",
      topics: ["Python", "Information Retrieval", "BM25", "TF-IDF", "Evaluation", "Benchmarking"],
      repository: "https://github.com/OmprakashSahani/searcheval-lab",
      bullets: [
        { text: "Built a reproducible framework for evaluating search and retrieval systems with Precision@K, Recall@K, MRR, and NDCG." },
        { text: "Implemented TF-IDF and BM25 search engines behind a common interface so different retrieval approaches could be compared in the same evaluation workflow." },
        { text: "Added latency measurement, benchmark artifacts, Markdown reports, regression detection, configurable thresholds, and query-level failure analysis." },
        { text: "Added CLI and API workflows, tests, examples, CI integration, and hybrid-search support." },
      ],
    },
    {
      name: "Distributed Training Profiler",
      topics: ["Python", "Distributed Training", "Performance Analysis", "Memory Profiling"],
      bullets: [
        { text: "Built a profiling and simulation tool for understanding communication overhead, memory use, synchronization costs, and scalability bottlenecks in distributed ML workloads." },
        { text: "Added collective-communication analysis, memory diagnostics, GPU-fit analysis, ZeRO optimization analysis, and performance benchmarking workflows." },
      ],
    },
  ] satisfies readonly ResumeProject[],
  education: [
    {
      institution: "Sanjay Ghodawat University",
      qualification: "Bachelor of Technology (B.Tech)",
      field: "Computer Science and Engineering",
      location: "Kolhapur, Maharashtra",
      date: "Jul 2020 – May 2023",
      details: ["CGPA: 8.40/10.0", "First Class with Distinction"],
    },
    {
      institution: "Maharashtra State Board of Technical Education (MSBTE)",
      qualification: "Diploma in Computer Engineering",
      location: "Kolhapur, Maharashtra",
      date: "Jul 2017 – May 2020",
      details: ["First Class"],
    },
  ] satisfies readonly ResumeEducation[],
  skills: [
    { category: "Programming", skills: ["Python", "Java", "C++", "C", "R", "SQL"] },
    { category: "Machine Learning", skills: ["PyTorch", "NumPy", "Pandas", "Scikit-learn", "Deep Learning", "Transformers"] },
    { category: "ML Systems", skills: ["Training Infrastructure", "Inference", "Benchmarking", "Evaluation", "Observability", "Reproducibility", "Performance Analysis"] },
    { category: "Distributed Systems", skills: ["Distributed Training", "Communication Analysis", "Synchronization", "Scalability Analysis", "Memory Profiling"] },
    { category: "Search & Evaluation", skills: ["BM25", "TF-IDF", "Ranking Metrics", "Retrieval Evaluation", "Regression Analysis", "Failure Analysis"] },
    { category: "Robot Learning", skills: ["Robotics Data Analysis", "State Trajectories", "Workspace Coverage", "Forward Kinematics"] },
    { category: "Backend & Infrastructure", skills: ["FastAPI", "REST APIs", "Docker", "Linux", "CLI Tooling"] },
    { category: "Developer Tools", skills: ["Git", "GitHub", "GitHub Actions", "Testing", "CI/CD"] },
  ] satisfies readonly ResumeSkillCategory[],
  researchInterests: [
    { text: "ML Systems" },
    { text: "Robot Learning" },
    { text: "AI Evaluation" },
    { text: "Distributed Systems" },
  ] satisfies readonly ResumeTextItem[],
} as const satisfies ResumeData;
