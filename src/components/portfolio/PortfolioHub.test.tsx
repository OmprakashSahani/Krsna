// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PortfolioHub } from "./PortfolioHub";
import { AboutFavoritesCarousel } from "@/components/AboutFavoritesCarousel";
import { aboutStories } from "@/data/about";
import { sections } from "./sections";

beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

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
