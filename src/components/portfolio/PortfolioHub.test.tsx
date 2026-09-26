// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PortfolioHub } from "./PortfolioHub";
import { AboutFavoritesCarousel } from "@/components/AboutFavoritesCarousel";
import { aboutStories } from "@/data/about";
import { sections } from "./sections";
import { ResumeDownloadDialog } from "@/components/ResumeDownloadDialog";

beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("includes panel content in the initial HTML without mounting heavyweight previews", () => {
  const document = new DOMParser().parseFromString(renderToStaticMarkup(<PortfolioHub />), "text/html");
  const content = document.body.textContent;
  for (const story of aboutStories) for (const paragraph of story.paragraphs) expect(content).toContain(paragraph.text);
  for (const text of ["Omprakash Sahani", "Resume / PDF document", "DOWNLOAD RESUME", "Open PDF", "LeRobot State Atlas", "SplatLab", "SearchEval Lab", "EvidencePatch", "Atlas AI", "ML Systems", "Coming soon.", "Omprakash.Sahani1206@gmail.com"])
    expect(content).toContain(text);
  expect(document.querySelector('a[download]')?.getAttribute("href")).toBe("/documents/omprakash-sahani-resume.pdf");
  expect(document.querySelector('a[aria-label="LeRobot State Atlas — View project"]')?.getAttribute("href")).toBe("/projects/lerobot-state-atlas");
  expect(document.querySelector("object")).toBeNull();
  expect(document.querySelector("video")).toBeNull();

  const view = render(<PortfolioHub />);
  expect(view.container.querySelector("object, video")).toBeNull();
  fireEvent.click(view.getByRole("button", { name: "01 About" }));
  expect(view.container.querySelector("object, video")).toBeNull();
});

it("mounts the unchanged Work video on first visit and retains it across close/reopen", () => {
  const view = render(<PortfolioHub />);
  const open = () => fireEvent.click(view.getByRole("button", { name: "03 Current work" }));
  open();
  const video = view.getByLabelText("Gaussian Splat workspace reconstruction demo");
  expect(video.tagName).toBe("VIDEO");
  expect(video.getAttribute("src")).toBe("/videos/projects/lerobot-state-atlas/gaussian-splat-demo.mp4");
  expect(video.getAttribute("poster")).toBe("/images/projects/lerobot-workspace.jpg");
  expect(video.getAttribute("preload")).toBe("metadata");
  for (const attribute of ["controls", "playsinline"]) expect(video.hasAttribute(attribute)).toBe(true);
  for (const attribute of ["autoplay", "loop", "muted"]) expect(video.hasAttribute(attribute)).toBe(false);
  expect(view.container.querySelector("object")).toBeNull();
  const pause = vi.spyOn(video as HTMLVideoElement, "pause").mockImplementation(() => {});
  Object.defineProperty(video, "paused", { configurable: true, value: false });
  fireEvent.click(view.getByRole("button", { name: "Close current work" }));
  expect(pause).toHaveBeenCalledOnce();
  expect(view.container.querySelector("video")).toBe(video);
  open();
  expect(view.container.querySelector("video")).toBe(video);
  pause.mockRestore();
});

it("mounts the Resume preview on first visit while preserving actions and the preview across reopening", () => {
  const view = render(<PortfolioHub />);
  const open = () => fireEvent.click(view.getByRole("button", { name: "02 Resume" }));
  open();
  const preview = view.getByLabelText("Omprakash Sahani resume preview");
  expect(preview.tagName).toBe("OBJECT");
  expect(preview.getAttribute("data")).toBe("/documents/omprakash-sahani-resume.pdf");
  expect(preview.getAttribute("type")).toBe("application/pdf");
  for (const name of [/DOWNLOAD RESUME/, /Open PDF/]) expect(view.getByRole("link", { name }).getAttribute("href")).toBe(preview.getAttribute("data"));
  expect(view.container.querySelector("video")).toBeNull();
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(view.container.querySelector("object")).toBe(preview);
  open();
  expect(view.container.querySelector("object")).toBe(preview);
  fireEvent.click(view.getByRole("button", { name: "03 Current work" }));
  expect(view.container.querySelector("object")).toBe(preview);
  expect(view.container.querySelector("video")).not.toBeNull();
});

it.each(["resume", "work"] as const)("includes the initially visited %s preview in the initial HTML", (initialSection) => {
  const html = new DOMParser().parseFromString(renderToStaticMarkup(<PortfolioHub initialSection={initialSection} />), "text/html");
  const preview = initialSection === "resume" ? "object" : "video";
  const other = initialSection === "resume" ? "video" : "object";
  expect(html.querySelector(preview)).not.toBeNull();
  expect(html.querySelector(other)).toBeNull();
  const view = render(<PortfolioHub initialSection={initialSection} />);
  expect(view.container.querySelector(preview)).not.toBeNull();
  expect(view.container.querySelector(other)).toBeNull();
});

it("keeps the shared Resume dialog preview enabled by default", () => {
  const view = render(<ResumeDownloadDialog />);
  const preview = view.container.querySelector("dialog object");
  expect(preview?.getAttribute("data")).toBe("/documents/omprakash-sahani-resume.pdf");
  expect(view.container.querySelector("a[download]")?.getAttribute("href")).toBe(preview?.getAttribute("data"));
});

it("starts with a stable Krsna link, eight section controls, and no modal", () => {
  const view = render(<PortfolioHub />);
  expect(view.getByRole("link", { name: "Kṛṣṇa — open the Krishna page" }).getAttribute("href")).toBe("/krishna");
  expect(view.getByRole("heading", { level: 1 }).textContent).toBe("Krsna");
  expect(view.queryByRole("complementary")).toBeNull();
  expect(view.queryByRole("dialog")).toBeNull();
  for (const section of sections) expect(view.getByRole("button", { name: `${section.index} ${section.label}` }).getAttribute("aria-expanded")).toBe("false");
  const pause = view.getByRole("button", { name: /Pause motion/ });
  fireEvent.click(pause);
  expect(pause.getAttribute("aria-pressed")).toBe("true");
});

it.each(sections)("opens $label on its assigned side and restores focus on Escape", (section) => {
  const view = render(<PortfolioHub />);
  {
    const trigger = view.getByRole("button", { name: `${section.index} ${section.label}` });
    fireEvent.click(trigger);
    const panel = view.getByRole("complementary");
    expect(panel.getAttribute("data-side")).toBe(section.side);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panel.contains(document.activeElement)).toBe(true);
    expect(view.getAllByRole("button").filter(button => button.getAttribute("aria-expanded") === "true")).toHaveLength(1);
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(view.queryByRole("complementary")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  }
});

it("preserves the complete About narrative, PDF actions, and honest writing state", () => {
  const view = render(<PortfolioHub />);
  fireEvent.click(view.getByRole("button", { name: "01 About" }));
  const about = view.getByRole("complementary");
  for (const story of aboutStories) for (const paragraph of story.paragraphs) expect(about.textContent).toContain(paragraph.text);
  expect(view.getByRole("img", { name: "Omprakash Sahani" }).getAttribute("src")).toContain("omprakash-r-sahani.png");
  fireEvent.click(view.getByRole("button", { name: "02 Resume" }));
  const download = view.getByRole("link", { name: /DOWNLOAD RESUME/ });
  expect(download.getAttribute("href")).toBe("/documents/omprakash-sahani-resume.pdf");
  expect(download.hasAttribute("download")).toBe(true);
  expect(view.getByLabelText("Omprakash Sahani resume preview").getAttribute("data")).toBe(download.getAttribute("href"));
  fireEvent.click(view.getByRole("button", { name: "06 Writing" }));
  expect(view.getByRole("heading", { name: "Coming soon." })).toBeTruthy();
});

it("makes only the covered mobile background inert, and restores it on close", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const view = render(<PortfolioHub />);
  const trigger = view.getByRole("button", { name: "07 Contact" });
  const stage = trigger.closest("nav")!.parentElement!;
  fireEvent.click(trigger);
  expect(stage.inert).toBe(true);
  fireEvent.click(view.getByRole("button", { name: "Close contact" }));
  expect(stage.inert).toBe(false);
  expect(document.activeElement).toBe(trigger);
});

it("makes all nine favorites and the original Vedabase links reachable manually", () => {
  const view = render(<AboutFavoritesCarousel />);
  const seen: string[] = [];
  for (let index = 0; index < 9; index++) {
    seen.push(view.getByRole("img").getAttribute("alt")!);
    if (index < 3) expect(view.getByRole("link").getAttribute("href")).toBe(["https://vedabase.io/en/library/kb/", "https://vedabase.io/en/library/sb/", "https://vedabase.io/en/library/bg/"][index]);
    fireEvent.click(view.getByRole("button", { name: "Next favorite" }));
  }
  expect(new Set(seen).size).toBe(9);
  expect(view.getByRole("img").getAttribute("alt")).toBe(seen[0]);
  fireEvent.click(view.getByRole("button", { name: "Previous favorite" }));
  expect(view.getByRole("img").getAttribute("alt")).toBe("Superman");
});

it("restarts Favorites at the first book after closing or switching panels", () => {
  const view = render(<PortfolioHub />);
  const open = () => fireEvent.click(view.getByRole("button", { name: "04 Favorites" }));
  open();
  fireEvent.click(view.getByRole("button", { name: "Next favorite" }));
  expect(view.getByRole("status").textContent).toMatch(/^02/);
  fireEvent.click(view.getByRole("button", { name: "Close favorites" }));
  open();
  expect(view.getByRole("status").textContent).toMatch(/^01/);
  fireEvent.click(view.getByRole("button", { name: "Previous favorite" }));
  fireEvent.click(view.getByRole("button", { name: "01 About" }));
  open();
  expect(view.getByRole("status").textContent).toMatch(/^01/);
  expect(view.getByRole("link", { name: /Kṛṣṇa: The Supreme Personality of Godhead/ }).getAttribute("href")).toBe("https://vedabase.io/en/library/kb/");
});
