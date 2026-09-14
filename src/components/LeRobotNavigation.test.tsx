// @vitest-environment jsdom

import { cleanup, render, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import HomePage from "@/app/page";
import { projects } from "@/data/projects";
import { ProjectIndex } from "./ProjectIndex";

afterEach(cleanup);

it("links LeRobot to its portfolio page from home and the index while retaining its repository", () => {
  const route = "/projects/lerobot-state-atlas";
  const home = render(<HomePage />);
  const homeLink = home.getByRole("link", { name: "LeRobot State Atlas" });
  expect(homeLink.getAttribute("href")).toBe(route);
  expect(homeLink.hasAttribute("target")).toBe(false);
  home.unmount();

  const index = render(<ProjectIndex />);
  const article = index.getByRole("heading", { name: "LeRobot State Atlas" }).closest("article");
  expect(article).not.toBeNull();
  const indexLink = within(article!).getByRole("link", { name: "View project" });
  expect(indexLink.getAttribute("href")).toBe(route);
  expect(indexLink.hasAttribute("target")).toBe(false);

  expect(projects.find((project) => project.title === "LeRobot State Atlas")).toMatchObject({
    page: route,
    repository: "https://github.com/OmprakashSahani/lerobot-state-atlas",
  });
});
