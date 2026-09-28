// @vitest-environment jsdom

import { setTestUrl } from "@/test/portfolio-navigation";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import HomePage from "@/app/(portfolio)/page";
import PortfolioLayout from "@/app/(portfolio)/layout";
import LeRobotStateAtlasContent from "@/components/projects/LeRobotStateAtlasContent";
import { projects } from "@/data/projects";

beforeEach(() => { setTestUrl("/"); vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("renders the Gaussian Splat video with intentional inline playback and native controls", () => {
  const page = render(<LeRobotStateAtlasContent />);
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

it("links LeRobot to its portfolio page from Current Work while retaining its repository", async () => {
  const route = "/?panel=work&project=lerobot-state-atlas";
  const home = render(<PortfolioLayout>{await HomePage({ searchParams: Promise.resolve({}) })}</PortfolioLayout>);
  fireEvent.click(home.getByRole("button", { name: "03 Current work" }));
  const homeLink = home.getByRole("link", { name: "LeRobot State Atlas — View project" });
  expect(homeLink.getAttribute("href")).toBe(route);
  expect(homeLink.hasAttribute("target")).toBe(false);
  expect(home.getByRole("link", { name: "LeRobot State Atlas — GitHub (opens in a new tab)" }).getAttribute("href")).toBe("https://github.com/OmprakashSahani/lerobot-state-atlas");
  expect(projects.find(project => project.title === "LeRobot State Atlas")).toMatchObject({ slug: "lerobot-state-atlas", repository: "https://github.com/OmprakashSahani/lerobot-state-atlas" });
  expect(home.queryByRole("link", { name: /Full project index/ })).toBeNull();
  expect(home.queryByRole("link", { name: "Atlas AI — View project" })).toBeNull();

});

it("retains the workspace pipeline, validation evidence, calibration boundaries and live demo", () => {
  const page = render(<LeRobotStateAtlasContent />);
  for (const heading of ["Overview", "The Problem", "Approach", "What I Built", "Evidence", "Current Work", "Boundaries", "Development Workflow", "Project Guidance"]) {
    expect(page.getByRole("region", { name: heading })).toBeTruthy();
  }
  const evidence = page.getByRole("region", { name: "Evidence" }).textContent;
  for (const value of ["10", "5,124", "10,248", "1,224", "0.020 m", "not the entire source dataset"]) expect(evidence).toContain(value);
  const approach = page.getByRole("region", { name: "Approach" }).textContent;
  for (const text of ["TRLC-DK1 follower URDF", "Forward kinematics", "exact distances between voxel centres", "does not establish calibrated physical geometry"]) expect(approach).toContain(text);
  const boundaries = page.getByRole("region", { name: "Boundaries" }).textContent;
  expect(boundaries).toContain("0.8 m baseline spacing is a visualization assumption");
  expect(boundaries).toContain("not a validated digital twin");
  expect(page.getByRole("link", { name: /Live Demo.*opens in a new tab/ }).getAttribute("href")).toBe("https://lerobot-state-atlas.vercel.app");
});
