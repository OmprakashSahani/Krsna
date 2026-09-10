// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import ProjectsPage from "@/app/projects/page";
import { projects } from "@/data/projects";
import { ProjectIndex } from "./ProjectIndex";

const atlasPage = "/projects/lerobot-state-atlas";
const atlasRepository = "https://github.com/OmprakashSahani/lerobot-state-atlas";
const repositoryProjects = [
  ["Atlas AI", "https://github.com/OmprakashSahani/atlas-ai"],
  ["Codex Benchmark Guardian", "https://github.com/OmprakashSahani/codex-benchmark-guardian"],
  ["EvidencePatch", "https://github.com/OmprakashSahani/evidencepatch"],
  ["SearchEval Lab", "https://github.com/OmprakashSahani/searcheval-lab"],
] as const;

afterEach(cleanup);

function expectInternalAtlasLink(link: HTMLElement) {
  expect(link.getAttribute("href")).toBe(atlasPage);
  expect(link.hasAttribute("target")).toBe(false);
  expect(link.hasAttribute("rel")).toBe(false);
  expect(link.querySelector(".sr-only")).toBeNull();
  expect(link.textContent).not.toContain("opens in a new tab");
  expect(link.textContent).not.toContain("↗");
}

describe("portfolio project navigation", () => {
  it("gives LeRobot its internal page while retaining its repository", () => {
    expect(projects.filter((project) => project.title === "LeRobot State Atlas")).toEqual([
      expect.objectContaining({ page: atlasPage, repository: atlasRepository }),
    ]);
    expect(projects.filter((project) => project.page).map((project) => project.title)).toEqual([
      "LeRobot State Atlas",
    ]);
  });

  it.each([
    ["ProjectIndex", ProjectIndex],
    ["Projects page", ProjectsPage],
  ] as const)("renders exactly one internal LeRobot link in %s", (_name, Component) => {
    const { container } = render(<Component />);
    const article = screen.getByRole("heading", { name: "LeRobot State Atlas" }).closest("article")!;
    const link = within(article).getByRole("link", { name: "View project" });
    expectInternalAtlasLink(link);
    expect(within(article).getAllByRole("link")).toHaveLength(1);
    expect(container.querySelectorAll(`a[href="${atlasPage}"]`)).toHaveLength(1);
    expect(container.querySelectorAll(`a[href="${atlasRepository}"]`)).toHaveLength(0);
  });

  it.each(repositoryProjects)("preserves the external repository link for %s", (title, repository) => {
    render(<ProjectIndex />);
    const article = screen.getByRole("heading", { name: title }).closest("article")!;
    const link = within(article).getByRole("link", { name: /^View repository\s*\(opens in a new tab\)$/ });
    expect(link.getAttribute("href")).toBe(repository);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
    expect(link.querySelector(".sr-only")?.textContent).toBe(" (opens in a new tab)");
    expect(link.querySelector('[aria-hidden="true"]')?.textContent).toBe(" ↗");
    expect(within(article).getAllByRole("link")).toHaveLength(1);
  });

  it("renders exactly one internal LeRobot Current Work link on the homepage", () => {
    const { container } = render(<HomePage />);
    const currentWork = screen.getByRole("region", { name: "Current work" });
    const link = within(currentWork).getByRole("link", { name: "LeRobot State Atlas" });
    expectInternalAtlasLink(link);
    expect(container.querySelectorAll(`a[href="${atlasPage}"]`)).toHaveLength(1);
    expect(container.querySelectorAll(`a[href="${atlasRepository}"]`)).toHaveLength(0);
    expect(within(currentWork).getAllByRole("link").map((item) => item.textContent)).toEqual([
      "LeRobot State Atlas",
      "SearchEval Lab (opens in a new tab)",
      "EvidencePatch (opens in a new tab)",
      "Atlas AI (opens in a new tab)",
    ]);
  });

  it("preserves external navigation for every other Current Work item", () => {
    render(<HomePage />);
    const currentWork = screen.getByRole("region", { name: "Current work" });
    for (const [title, repository] of repositoryProjects.filter(([title]) => title !== "Codex Benchmark Guardian")) {
      const link = within(currentWork).getByRole("link", { name: new RegExp(`^${title}\\s*\\(opens in a new tab\\)$`) });
      expect(link.getAttribute("href")).toBe(repository);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.querySelector(".sr-only")?.textContent).toBe(" (opens in a new tab)");
    }
  });
});
