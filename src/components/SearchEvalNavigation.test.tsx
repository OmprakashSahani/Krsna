// @vitest-environment jsdom

import { cleanup, render, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import HomePage from "@/app/page";
import SearchEvalLabPage, { metadata } from "@/app/projects/searcheval-lab/page";
import { projects } from "@/data/projects";
import { ProjectIndex } from "./ProjectIndex";

afterEach(cleanup);

const route = "/projects/searcheval-lab";
const repository = "https://github.com/OmprakashSahani/searcheval-lab";

it("links SearchEval internally from home and the index while retaining its repository", () => {
  const home = render(<HomePage />);
  const homeLink = home.getByRole("link", { name: "SearchEval Lab" });
  expect(homeLink.getAttribute("href")).toBe(route);
  expect(homeLink.hasAttribute("target")).toBe(false);
  home.unmount();

  const index = render(<ProjectIndex />);
  const article = index.getByRole("heading", { name: "SearchEval Lab" }).closest("article");
  expect(article).not.toBeNull();
  const indexLink = within(article!).getByRole("link", { name: "View project" });
  expect(indexLink.getAttribute("href")).toBe(route);
  expect(indexLink.hasAttribute("target")).toBe(false);
  expect(projects.find((project) => project.title === "SearchEval Lab")).toMatchObject({ page: route, repository });

  for (const title of ["Atlas AI", "Codex Benchmark Guardian"]) {
    const otherArticle = index.getByRole("heading", { name: title }).closest("article");
    const link = within(otherArticle!).getByRole("link", { name: /View repository/ });
    expect(link.getAttribute("href")).toBe(projects.find((project) => project.title === title)?.repository);
    expect(link.getAttribute("target")).toBe("_blank");
  }
});

it("provides a route home and the real repository without a demo link", () => {
  const page = render(<SearchEvalLabPage />);
  expect(page.getByRole("link", { name: "Return to homepage" }).getAttribute("href")).toBe("/");
  const github = page.getByRole("link", { name: /GitHub Repository/ });
  expect(github.getAttribute("href")).toBe(repository);
  expect(github.getAttribute("rel")?.split(" ")).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  expect(page.queryByRole("link", { name: /Live Demo/i })).toBeNull();
  expect(page.getAllByRole("link")).toHaveLength(2);
});

it("preserves explicit list semantics for the System Workflow ordered list", () => {
  const page = render(<SearchEvalLabPage />);
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
