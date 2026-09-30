// @vitest-environment jsdom
import { setTestUrl } from "@/test/portfolio-navigation";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioHub } from "./PortfolioHub";

beforeEach(() => {
  setTestUrl("/");
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Current Work project previews", () => {
  it("renders Codex Benchmark Guardian with its recorded demo and live app", () => {
    const view = render(<PortfolioHub />);

    fireEvent.click(view.getByRole("button", { name: "03 Current work" }));

    expect(view.getByText("Codex Benchmark Guardian")).toBeTruthy();

    const video = view.getByLabelText(
      "Codex Benchmark Guardian OpenAI Build Week demo",
    );
    expect(video.getAttribute("src")).toBe(
      "/videos/projects/codex-benchmark-guardian/demo.mp4",
    );
    expect(video.getAttribute("poster")).toBe(
      "/images/projects/codex-benchmark-guardian-demo.webp",
    );

    expect(
      view.getByRole("link", {
        name: "Codex Benchmark Guardian — Live demo (opens in a new tab)",
      }).getAttribute("href"),
    ).toBe("https://codex-benchmark-guardian.vercel.app");

    expect(
      view.getByRole("link", {
        name: "Codex Benchmark Guardian — GitHub (opens in a new tab)",
      }).getAttribute("href"),
    ).toBe("https://github.com/OmprakashSahani/codex-benchmark-guardian");
  });

  it("renders ThermalShift AI with its certificate and live app", () => {
    const view = render(<PortfolioHub />);

    fireEvent.click(view.getByRole("button", { name: "03 Current work" }));

    expect(view.getByText("ThermalShift AI")).toBeTruthy();

    expect(
      view.getByRole("link", {
        name: "ThermalShift AI certificate (opens in a new tab)",
      }).getAttribute("href"),
    ).toBe(
      "/documents/projects/thermalshift-ai/fortyguard-hackathon-certificate.jpg",
    );

    expect(
      view.getByRole("img", {
        name: "FortyGuard Hackathon 2026 certificate for Omprakash Sahani",
      }),
    ).toBeTruthy();

    expect(
      view.getByRole("link", {
        name: "ThermalShift AI — Live demo (opens in a new tab)",
      }).getAttribute("href"),
    ).toBe("https://thermalshift-ai.onrender.com/");
  });
});
