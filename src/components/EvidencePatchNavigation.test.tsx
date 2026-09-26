// @vitest-environment jsdom

import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import EvidencePatchPage, { metadata } from "@/app/projects/evidencepatch/page";
import { projects } from "@/data/projects";
import { ProjectIndex } from "./ProjectIndex";

beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const route = "/projects/evidencepatch";
const repository = "https://github.com/OmprakashSahani/evidencepatch";

it("links EvidencePatch internally from home and the index while retaining its repository", async () => {
  const home = render(await HomePage({ searchParams: Promise.resolve({}) }));
  fireEvent.click(home.getByRole("button", { name: "03 Current work" }));
  const homeLink = home.getByRole("link", { name: "EvidencePatch — View project" });
  expect(homeLink.getAttribute("href")).toBe(route);
  expect(homeLink.hasAttribute("target")).toBe(false);
  expect(home.getByRole("link", { name: /Atlas AI/ }).getAttribute("href")).toBe("https://github.com/OmprakashSahani/atlas-ai");
  home.unmount();

  const index = render(<ProjectIndex />);
  const article = index.getByRole("heading", { name: "EvidencePatch" }).closest("article");
  expect(article).not.toBeNull();
  const link = within(article!).getByRole("link", { name: "View project" });
  expect(link.getAttribute("href")).toBe(route);
  expect(link.hasAttribute("target")).toBe(false);
  expect(projects.find((project) => project.title === "EvidencePatch")).toMatchObject({ page: route, repository });
});

it("provides accessible home and source links without inventing a live demo or license", () => {
  const page = render(<EvidencePatchPage />);
  expect(page.getByRole("link", { name: "Return to homepage" }).getAttribute("href")).toBe("/");
  for (const [label, href] of [
    ["GitHub Repository", repository],
    ["Public MCP Demo", `${repository}/blob/main/docs/public_mcp_demo.md`],
  ]) {
    const link = page.getByRole("link", { name: (name) => name.replace(/\s*\(/, " (") === `${label} (opens in a new tab)` });
    expect(link.getAttribute("href")).toBe(href);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")?.split(" ")).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  }
  expect(page.getAllByRole("link")).toHaveLength(4);
  expect(page.queryByRole("link", { name: /Live Demo/i })).toBeNull();
  expect(page.queryByText("License")).toBeNull();
});

it("links the participation certificate preview to the original PDF with accessible new-tab text", () => {
  const page = render(<EvidencePatchPage />);
  const preview = page.getByRole("img", { name: "micro1 Frontier Engineering Challenge 2026 Certificate of Participation for Omprakash Sahani" });
  const link = page.getByRole("link", { name: /View micro1 Frontier Engineering Challenge certificate \(PDF\).*opens in a new tab/ });
  expect(link.contains(preview)).toBe(true);
  expect(link.getAttribute("href")).toBe("/documents/projects/evidencepatch/micro1-frontier-engineering-challenge-certificate.pdf");
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")?.split(" ")).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  const challenge = page.getByRole("region", { name: "Challenge" });
  expect(challenge.textContent).toBe("ChallengeEvidencePatch was part of the micro1 Frontier Engineering Challenge 2026.Certificate of Participation");
  const intro = page.getByRole("heading", { level: 1, name: "EvidencePatch" }).parentElement;
  expect(intro?.textContent).not.toContain("EvidencePatch was part of the micro1 Frontier Engineering Challenge 2026.");
});

it("puts metadata before the story and preserves list and decorative-trace accessibility", () => {
  const page = render(<EvidencePatchPage />);
  const rail = page.getByRole("complementary", { name: "Project facts" });
  const story = rail.nextElementSibling;
  expect(rail.getAttribute("data-trace")).toBe("left");
  expect(story).not.toBeNull();
  expect(within(rail).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
    "Challenge", "Links", "Project", "Features", "Tools", "Agent Stack", "Built By",
  ]);
  expect(within(story as HTMLElement).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
    "Overview", "The Problem", "Design Principle", "Architecture", "What I Built", "Measured Result", "Main Failure Mode", "Public Evidence Demo", "Boundaries",
  ]);
  for (const list of page.getAllByRole("list")) {
    expect(list.getAttribute("role")).toBe("list");
  }
  for (const section of within(rail).getAllByRole("region")) {
    expect(section.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  }
});

it("keeps the benchmark limitations and human-review boundary explicit", () => {
  const page = render(<EvidencePatchPage />);
  const result = page.getByRole("region", { name: "Measured Result" });
  expect(result.textContent).toContain("12 synthetic");
  expect(result.textContent).toContain("gpt-5.6-sol");
  for (const value of ["91.67%", "100.00%", "+8.33", "1.75×", "1.83×", "595.405 → 1090.656 seconds"]) {
    expect(result.textContent).toContain(value);
  }
  expect(result.textContent).toContain("not an equal-inference-budget comparison");
  expect(result.textContent).toContain("not a claim of statistical significance or evidence of clinical safety");
  const boundaries = page.getByRole("region", { name: "Boundaries" });
  expect(boundaries.textContent).toContain("does not make clinical decisions");
  expect(boundaries.textContent).toContain("Outputs are not medical advice");
  expect(boundaries.textContent).toContain("PATCH does not mean deployment permission");
  expect(boundaries.textContent).toContain("PATCH and ESCALATE require human review");
});

it("sets project-specific canonical and social metadata", () => {
  expect(metadata.title).toBe("EvidencePatch");
  expect(metadata.description).toEqual(expect.any(String));
  expect(metadata.alternates).toEqual({ canonical: route });
  expect(metadata.openGraph).toEqual({
    type: "website",
    title: "EvidencePatch — Omprakash Sahani",
    description: metadata.description,
    siteName: "Omprakash Sahani",
  });
  expect(metadata.twitter).toEqual({
    card: "summary",
    title: "EvidencePatch — Omprakash Sahani",
    description: metadata.description,
  });
});
