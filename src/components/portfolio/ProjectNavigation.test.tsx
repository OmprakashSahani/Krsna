// @vitest-environment jsdom
import { setTestUrl } from "@/test/portfolio-navigation";
import { act, cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PortfolioHub } from "./PortfolioHub";
import { projectDetails, projectHref, type ProjectSlug } from "@/data/project-details";

beforeEach(() => {
  setTestUrl("/");
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function openWork() {
  const view = render(<PortfolioHub />);
  fireEvent.click(view.getByRole("button", { name: "03 Current work" }));
  return view;
}

it.each(Object.keys(projectDetails) as ProjectSlug[])("replaces the list with %s inside the same Work shell and restores list scroll/focus", slug => {
  const view = openWork();
  expect(window.location.search).toBe("?panel=work");
  const work = view.getByRole("complementary", { name: "03 / Current work" });
  const video = work.querySelector("video");
  const header = work.firstElementChild;
  const headerMarkup = header!.outerHTML;
  const stage = view.getByRole("button", { name: "03 Current work" }).closest("nav")!.parentElement!;
  const stageMarkup = stage.innerHTML;
  work.scrollTop = 260;
  const trigger = within(work).getByRole("link", { name: `${projectDetails[slug].title} — View project` });
  fireEvent.click(trigger);
  const detail = view.getByRole("region", { name: `${projectDetails[slug].title} case study` });
  expect(window.location.pathname + window.location.search).toBe(projectHref(slug));
  expect(work.getAttribute("data-open")).toBe("true");
  expect(work.hasAttribute("inert")).toBe(false);
  expect(work.scrollTop).toBe(0);
  expect(detail.closest("[data-side]")).toBe(work);
  expect(work.firstElementChild).toBe(header);
  expect(header!.outerHTML).toBe(headerMarkup);
  expect(stage.innerHTML).toBe(stageMarkup);
  expect(view.container.querySelector("main")?.getAttribute("data-panel")).toBe("left");
  expect(view.container.querySelectorAll("[data-side]")).toHaveLength(2);
  expect(view.container.querySelectorAll('[data-side][data-open="true"]')).toHaveLength(1);
  expect(view.container.querySelector("#portfolio-panel-right [data-project]")).toBeNull();
  expect(view.container.querySelector("main")?.children).toHaveLength(3);
  expect(view.queryByRole("link", { name: `${projectDetails[slug].title} — View project` })).toBeNull();
  expect(work.querySelector("video")).toBe(video);
  expect(detail.contains(document.activeElement)).toBe(true);
  expect(within(detail).getByRole("heading", { level: 1, name: projectDetails[slug].title })).toBeTruthy();
  expect(within(detail).getByRole("region", { name: "Boundaries" }).textContent!.length).toBeGreaterThan(200);
  expect(detail.querySelector("main, footer, .site-header")).toBeNull();
  fireEvent.click(within(detail).getByRole("button", { name: "← CURRENT WORK" }));
  expect(view.queryByRole("region", { name: /case study$/ })).toBeNull();
  expect(window.location.search).toBe("?panel=work");
  expect(work.getAttribute("data-open")).toBe("true");
  expect(work.scrollTop).toBe(260);
  expect(document.activeElement).toBe(trigger);
});

it("prioritizes project Escape and lets the second Escape close Work", () => {
  const view = openWork();
  fireEvent.click(view.getByRole("link", { name: "EvidencePatch — View project" }));
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(window.location.search).toBe("?panel=work");
  expect(view.queryByRole("region", { name: /case study$/ })).toBeNull();
  expect(view.getByRole("complementary").getAttribute("data-open")).toBe("true");
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(window.location.search).toBe("");
  expect(view.queryByRole("complementary")).toBeNull();
  expect(document.activeElement).toBe(view.getByRole("button", { name: "03 Current work" }));
});

it.each(Object.keys(projectDetails) as ProjectSlug[])("server renders and restores the initial %s deep link", slug => {
  setTestUrl(projectHref(slug));
  const html = new DOMParser().parseFromString(renderToStaticMarkup(<PortfolioHub />), "text/html");
  expect(html.querySelector('#portfolio-panel-left')?.getAttribute("data-open")).toBe("true");
  expect(html.querySelector(`#portfolio-panel-left [data-project="${slug}"] #project-title`)?.textContent).toBe(projectDetails[slug].title);
  const view = render(<PortfolioHub />);
  const detail = view.getByRole("region", { name: `${projectDetails[slug].title} case study` });
  expect(detail.closest("aside")?.id).toBe("portfolio-panel-left");
  expect(document.activeElement).toBe(view.getByRole("button", { name: "← CURRENT WORK" }));
  fireEvent.click(view.getByRole("button", { name: "← CURRENT WORK" }));
  expect(window.location.search).toBe("?panel=work");
  expect(document.activeElement).toBe(view.getByRole("link", { name: `${projectDetails[slug].title} — View project` }));
});

it.each(["invalid-value", "__proto__", "constructor"])("removes invalid project %s safely", project => {
  setTestUrl(`/?panel=work&project=${project}`);
  const view = render(<PortfolioHub />);
  expect(view.queryByRole("region", { name: /case study$/ })).toBeNull();
  expect(window.location.search).toBe("?panel=work");
  expect(view.getByRole("complementary").getAttribute("data-side")).toBe("left");
});

it("rejects repeated project parameters consistently with server metadata", () => {
  setTestUrl("/?panel=work&project=evidencepatch&project=searcheval-lab");
  const view = render(<PortfolioHub />);
  expect(view.queryByRole("region", { name: /case study$/ })).toBeNull();
  expect(window.location.search).toBe("?panel=work");
});

it("keeps modified project clicks available as normal deep links", () => {
  const view = openWork();
  const trigger = view.getByRole("link", { name: "EvidencePatch — View project" });
  fireEvent.click(trigger, { ctrlKey: true });
  expect(window.location.search).toBe("?panel=work");
  expect(trigger.getAttribute("href")).toBe(projectHref("evidencepatch"));
  expect(view.queryByRole("region", { name: /case study$/ })).toBeNull();
});

it("mounts only the selected project's heavy detail media", () => {
  const view = render(<PortfolioHub />);
  expect(view.container.querySelector("video, object, [data-project], img[alt*='Certificate']")).toBeNull();
  fireEvent.click(view.getByRole("button", { name: "03 Current work" }));
  expect(view.container.querySelectorAll("video")).toHaveLength(1);
  fireEvent.click(view.getByRole("link", { name: "EvidencePatch — View project" }));
  expect(view.container.querySelectorAll("video")).toHaveLength(1);
  expect(view.getByRole("img", { name: /Certificate of Participation/ })).toBeTruthy();
  fireEvent.click(view.getByRole("button", { name: "← CURRENT WORK" }));
  expect(view.container.querySelector("[data-project]")).toBeNull();
  fireEvent.click(view.getByRole("link", { name: "LeRobot State Atlas — View project" }));
  expect(view.container.querySelectorAll("video")).toHaveLength(2);
  expect(view.queryByRole("img", { name: /Certificate of Participation/ })).toBeNull();
});

it("switches projects without replacing Work and clears project state for another section", () => {
  const view = openWork();
  const work = view.getByRole("complementary");
  fireEvent.click(view.getByRole("link", { name: "EvidencePatch — View project" }));
  fireEvent.click(view.getByRole("button", { name: "← CURRENT WORK" }));
  fireEvent.click(view.getByRole("link", { name: "SearchEval Lab — View project" }));
  expect(window.location.search).toBe("?panel=work&project=searcheval-lab");
  expect(view.getByRole("complementary", { name: "03 / Current work" })).toBe(work);
  expect(view.queryByRole("heading", { level: 1, name: "EvidencePatch" })).toBeNull();
  fireEvent.click(view.getByRole("button", { name: "01 About" }));
  expect(window.location.search).toBe("?panel=about");
  expect(view.queryByRole("region", { name: /case study$/ })).toBeNull();
  expect(document.activeElement?.id).toBe("panel-title-left");
});

it("restores project state with browser Back and Forward without remounting Work", async () => {
  const view = openWork();
  const work = view.getByRole("complementary");
  work.scrollTop = 300;
  fireEvent.scroll(work);
  const trigger = view.getByRole("link", { name: "EvidencePatch — View project" });
  fireEvent.click(trigger);
  await act(async () => {
    window.history.back();
    await new Promise(resolve => window.addEventListener("popstate", resolve, { once: true }));
  });
  expect(window.location.search).toBe("?panel=work");
  expect(view.queryByRole("region", { name: /case study$/ })).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(work.scrollTop).toBe(300);
  work.scrollTop = 420;
  fireEvent.scroll(work);
  await act(async () => {
    window.history.forward();
    await new Promise(resolve => window.addEventListener("popstate", resolve, { once: true }));
  });
  await waitFor(() => expect(view.getByRole("region", { name: "EvidencePatch case study" })).toBeTruthy());
  expect(view.getByRole("complementary", { name: "03 / Current work" })).toBe(work);
  expect(work.scrollTop).toBe(0);
  fireEvent.click(view.getByRole("button", { name: "← CURRENT WORK" }));
  expect(work.scrollTop).toBe(420);
});

it("keeps the same mobile Work panel interactive and the homepage inert in both nested views", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const view = openWork();
  const work = view.getByRole("complementary");
  const stage = view.getByRole("button", { name: "03 Current work" }).closest("nav")!.parentElement!;
  const trigger = view.getByRole("link", { name: "EvidencePatch — View project" });
  work.scrollTop = 400;
  fireEvent.click(trigger);
  expect(work.hasAttribute("inert")).toBe(false);
  expect(view.getByRole("region", { name: "EvidencePatch case study" }).closest("aside")).toBe(work);
  expect(work.scrollTop).toBe(0);
  expect(stage.inert).toBe(true);
  fireEvent.click(view.getByRole("button", { name: "← CURRENT WORK" }));
  expect(work.hasAttribute("inert")).toBe(false);
  expect(stage.inert).toBe(true);
  expect(work.scrollTop).toBe(400);
  expect(document.activeElement).toBe(trigger);
});

it("closes the entire Work panel with X while a project is selected", () => {
  const view = openWork();
  const work = view.getByRole("complementary");
  fireEvent.click(view.getByRole("link", { name: "EvidencePatch — View project" }));
  fireEvent.click(view.getByRole("button", { name: "Close current work" }));
  expect(window.location.search).toBe("");
  expect(work.getAttribute("data-open")).toBe("false");
  expect(view.queryByRole("region", { name: /case study$/ })).toBeNull();
  expect(view.queryByRole("complementary")).toBeNull();
  expect(document.activeElement).toBe(view.getByRole("button", { name: "03 Current work" }));
});

it("pauses the retained summary video when the case study replaces the list", () => {
  const view = openWork();
  const video = view.getByLabelText("Gaussian Splat workspace reconstruction demo") as HTMLVideoElement;
  const pause = vi.spyOn(video, "pause").mockImplementation(() => {});
  Object.defineProperty(video, "paused", { configurable: true, value: false });
  fireEvent.click(view.getByRole("link", { name: "EvidencePatch — View project" }));
  expect(pause).toHaveBeenCalledOnce();
  expect(view.queryByLabelText("Gaussian Splat workspace reconstruction demo")?.closest("[hidden]")).not.toBeNull();
  fireEvent.click(view.getByRole("button", { name: "← CURRENT WORK" }));
  expect(view.getByLabelText("Gaussian Splat workspace reconstruction demo")).toBe(video);
  pause.mockRestore();
});
