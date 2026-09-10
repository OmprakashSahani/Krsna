// @vitest-environment jsdom

// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ViewerEntry } from "./ViewerEntry";
import SharedWorldPage, { metadata as sharedMetadata } from "@/app/projects/lerobot-state-atlas/shared-world/page";
import Page, { metadata } from "@/app/projects/lerobot-state-atlas/page";

const state = vi.hoisted(() => ({ crash: false, options: {} as { ssr?: boolean } }));
vi.mock("next/dynamic", () => ({ default: (_loader: unknown, options: { ssr: boolean }) => {
  state.options = options;
  return function MockViewer() {
    if (state.crash) throw new Error("Renderer initialization failed");
    return <section aria-label="Loaded viewer" />;
  };
} }));
vi.mock("./AtlasDataProvider", () => ({ AtlasDataProvider: ({ children }: { children: ReactNode }) => children }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); state.crash = false; });

function scheduleDetection(supported: boolean) {
  let detect: FrameRequestCallback | undefined;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { detect = callback; return 1; });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  vi.stubGlobal("WebGL2RenderingContext", supported ? function WebGL2() {} : undefined);
  const loseContext = vi.fn();
  if (supported) vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ getExtension: () => ({ loseContext }) } as unknown as WebGL2RenderingContext);
  return { detect: () => act(() => detect?.(0)), loseContext };
}

describe("viewer client boundary and portfolio route", () => {
  it("uses the portfolio back link and accessible external GitHub link", () => {
    scheduleDetection(false);
    render(<Page />);
    expect(screen.getByRole("link", { name: "Return to homepage" }).getAttribute("href")).toBe("/");
    const github = screen.getByRole("link", { name: /GitHub\s*\(opens in a new tab\)/ });
    expect(github.getAttribute("href")).toBe("https://github.com/OmprakashSahani/lerobot-state-atlas");
    expect(github.getAttribute("target")).toBe("_blank");
    expect(github.getAttribute("rel")).toBe("noopener noreferrer");
    expect(github.querySelector(".sr-only")?.textContent).toBe(" (opens in a new tab)");
    expect(screen.getByText("PROJECT / ROBOT LEARNING")).toBeTruthy();
    expect(screen.getByText(String(metadata.description))).toBeTruthy();
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
  });

  it("keeps the editorial landing viewer-free and links internally to shared world", () => {
    const detection = scheduleDetection(true);
    render(<Page />);
    detection.detect();
    const link = screen.getByRole("link", { name: "Open shared world" });
    expect(link.getAttribute("href")).toBe("/projects/lerobot-state-atlas/shared-world");
    expect(link.hasAttribute("target")).toBe(false);
    expect(screen.queryByRole("region", { name: "Loaded viewer" })).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("link", { name: /Methodology/ }).getAttribute("href")).toBe("#methodology");
    expect(document.getElementById("methodology")).not.toBeNull();
  });

  it.each([false, true])("mounts one viewer on Shared World, with route navigation and one H1 (WebGL=%s)", (supported) => {
    const detection = scheduleDetection(supported);
    render(<SharedWorldPage />);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    detection.detect();
    expect(screen.getAllByRole("heading", { level: 1 }).map((heading) => heading.textContent)).toEqual(["Canonical Shared World"]);
    expect(screen.getByRole("link", { name: "Return to LeRobot State Atlas" }).getAttribute("href")).toBe("/projects/lerobot-state-atlas");
    const github = screen.getByRole("link", { name: /GitHub.*opens in a new tab/ });
    expect(github.getAttribute("target")).toBe("_blank");
    expect(github.getAttribute("rel")).toBe("noopener noreferrer");
    expect(github.getAttribute("href")).toBe("https://github.com/OmprakashSahani/lerobot-state-atlas");
    expect(sharedMetadata.alternates?.canonical).toBe("/projects/lerobot-state-atlas/shared-world");
    if (supported) expect(screen.getAllByRole("region", { name: "Loaded viewer" })).toHaveLength(1);
    else expect(screen.getByRole("alert").textContent).toContain("WebGL unavailable");
  });

  it("keeps stable loading markup until WebGL detection and provides an accessible unsupported state", () => {
    const detection = scheduleDetection(false);
    render(<ViewerEntry />);
    expect(screen.getByRole("status").textContent).toContain("Loading 3D viewer");
    detection.detect();
    expect(screen.getByRole("alert").textContent).toContain("WebGL unavailable");
    const link = screen.getByRole("link", { name: /View source and methodology/ });
    expect(link.getAttribute("href")).toBe("https://github.com/OmprakashSahani/lerobot-state-atlas");
    expect(link.textContent).toContain("opens in a new tab");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("loads the viewer only with WebGL support and disables its SSR", () => {
    const detection = scheduleDetection(true);
    render(<ViewerEntry />);
    expect(screen.queryByRole("region", { name: "Loaded viewer" })).toBeNull();
    detection.detect();
    expect(screen.getByRole("region", { name: "Loaded viewer" })).toBeTruthy();
    expect(state.options.ssr).toBe(false);
    expect(detection.loseContext).toHaveBeenCalledOnce();
  });

  it("catches renderer startup errors without crashing the page", () => {
    const detection = scheduleDetection(true);
    state.crash = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ViewerEntry />);
    detection.detect();
    expect(screen.getByRole("alert").textContent).toContain("Viewer unavailable");
    expect(screen.getByRole("button", { name: "Retry viewer" })).toBeTruthy();
  });

  it.each([false, true])("renders one page H1 with WebGL support=%s and route metadata", (supported) => {
    const detection = scheduleDetection(supported);
    render(<Page />);
    detection.detect();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("LeRobot State Atlas");
    expect(screen.getByRole("main").id).toBe("main-content");
    expect(metadata.title).toEqual({ absolute: "LeRobot State Atlas — Omprakash Sahani" });
    expect(metadata.alternates?.canonical).toBe("/projects/lerobot-state-atlas");
    expect(metadata.openGraph?.title).toBe("LeRobot State Atlas — Omprakash Sahani");
    expect(metadata.twitter?.title).toBe("LeRobot State Atlas — Omprakash Sahani");
  });
});
