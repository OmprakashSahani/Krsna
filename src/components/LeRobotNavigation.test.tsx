// @vitest-environment jsdom

import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import LeRobotStateAtlasPage from "@/app/projects/lerobot-state-atlas/page";
import { projects } from "@/data/projects";
import { ProjectIndex } from "./ProjectIndex";

beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("renders the Gaussian Splat video with intentional inline playback and native controls", () => {
  const page = render(<LeRobotStateAtlasPage />);
  const video = page.getByLabelText("Gaussian Splat workspace reconstruction demo");
  expect(video.tagName).toBe("VIDEO");
  expect(video.getAttribute("src")).toBe("/videos/projects/lerobot-state-atlas/gaussian-splat-demo.mp4");
  expect(video.hasAttribute("controls")).toBe(true);
  expect(video.hasAttribute("playsinline")).toBe(true);
  expect(video.getAttribute("preload")).toBe("metadata");
  expect(video.hasAttribute("autoplay")).toBe(false);
  expect(video.hasAttribute("loop")).toBe(false);
  expect(video.hasAttribute("muted")).toBe(false);
});

it("links LeRobot to its portfolio page from home and the index while retaining its repository", async () => {
  const route = "/projects/lerobot-state-atlas";
  const home = render(await HomePage({ searchParams: Promise.resolve({}) }));
  fireEvent.click(home.getByRole("button", { name: "03 Current work" }));
  const homeLink = home.getByRole("link", { name: "LeRobot State Atlas — View project" });
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
