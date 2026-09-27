// @vitest-environment jsdom

import { setTestUrl } from "@/test/portfolio-navigation";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import SearchEvalLabContent from "@/components/projects/SearchEvalLabContent";
import { projectMetadata } from "@/data/project-details";
const metadata = projectMetadata("searcheval-lab");
import { projects } from "@/data/projects";
import { ProjectDetailContent } from "./projects/ProjectDetailContent";

beforeEach(() => { setTestUrl("/"); vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const route = "/?panel=work&project=searcheval-lab";
const repository = "https://github.com/OmprakashSahani/searcheval-lab";

it("links SearchEval internally from Current Work while retaining its repository", async () => {
  const home = render(await HomePage({ searchParams: Promise.resolve({}) }));
  fireEvent.click(home.getByRole("button", { name: "03 Current work" }));
  const homeLink = home.getByRole("link", { name: "SearchEval Lab — View project" });
  expect(homeLink.getAttribute("href")).toBe(route);
  expect(homeLink.hasAttribute("target")).toBe(false);
  expect(home.getByRole("link", { name: "SearchEval Lab — GitHub (opens in a new tab)" }).getAttribute("href")).toBe("https://github.com/OmprakashSahani/searcheval-lab");
  expect(projects.find(project => project.title === "SearchEval Lab")).toMatchObject({ slug: "searcheval-lab", repository: "https://github.com/OmprakashSahani/searcheval-lab" });
  expect(home.queryByRole("link", { name: /Full project index/ })).toBeNull();
  expect(home.queryByRole("link", { name: "Atlas AI — View project" })).toBeNull();

});

it("provides a route to Current Work and the real repository without a demo link", () => {
  const close = vi.fn();
  const page = render(<ProjectDetailContent project="searcheval-lab" onBack={close} />);
  fireEvent.click(page.getByRole("button", { name: "← CURRENT WORK" }));
  expect(close).toHaveBeenCalledOnce();
  const github = page.getByRole("link", { name: /GitHub Repository/ });
  expect(github.getAttribute("href")).toBe(repository);
  expect(github.getAttribute("rel")?.split(" ")).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  expect(page.queryByRole("link", { name: /Live Demo/i })).toBeNull();
  expect(page.getAllByRole("link")).toHaveLength(1);
});

it("preserves explicit list semantics for the System Workflow ordered list", () => {
  const page = render(<SearchEvalLabContent />);
  const section = page.getByRole("heading", { name: "System Workflow" }).closest("section");
  expect(section).not.toBeNull();
  expect(section!.querySelector("ol")?.getAttribute("role")).toBe("list");
});

it("overrides homepage social metadata with the project description", () => {
  expect(metadata.title).toBe("SearchEval Lab");
  expect(metadata.description).toEqual(expect.any(String));
  expect(metadata.alternates).toEqual({ canonical: route });
  expect(metadata.openGraph).toEqual({
    type: "website",
    title: "SearchEval Lab — Omprakash Sahani",
    description: metadata.description,
    siteName: "Omprakash Sahani",
  });
  expect(metadata.twitter).toEqual({
    card: "summary",
    title: "SearchEval Lab — Omprakash Sahani",
    description: metadata.description,
  });
});

it("retains evaluation metrics, the ordered workflow, implementation and lexical-only boundaries", () => {
  const page = render(<SearchEvalLabContent />);
  const evaluation = page.getByRole("region", { name: "Evaluation" }).textContent;
  for (const value of ["0.1900", "1.0000", "0.9500", "0.9198", "+0.0100", "+0.0500", "+0.0085", "not production search-quality claims"]) expect(evaluation).toContain(value);
  const workflow = page.getByRole("region", { name: "System Workflow" });
  expect(Array.from(workflow.querySelectorAll("li")).map(item => item.textContent?.replace("→", ""))).toEqual([
    "Dataset", "Validation", "Search Method", "Top-K Results", "Ranking Metrics", "Benchmark Run", "Saved Artifacts", "Report", "Weak Query Analysis", "Regression Comparison",
  ]);
  expect(page.getByRole("region", { name: "What I Built" }).textContent).toContain("FastAPI backend exposes validation, benchmark execution, saved results, and run comparison through HTTP");
  const boundaries = page.getByRole("region", { name: "Boundaries" }).textContent;
  expect(boundaries).toContain("sample results are not production claims");
  expect(boundaries).toContain("Embedding-based and vector retrieval are not implemented");
});
