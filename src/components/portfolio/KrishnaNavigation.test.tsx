// @vitest-environment jsdom
import { setTestUrl } from "@/test/portfolio-navigation";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PortfolioHub } from "./PortfolioHub";
import { sections } from "./sections";
import { portfolioState } from "./navigation-state";

// Model Next Link's client navigation against the shared history test router.
vi.mock("next/link", () => ({
  default: function TestLink({ href, scroll, prefetch, ...props }: ComponentProps<"a"> & { href: string; scroll?: boolean; prefetch?: boolean }) {
    const router = useRouter();
    return <a {...props} href={href} data-prefetch={prefetch} onClick={event => {
      props.onClick?.(event);
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      router.push(href, { scroll });
    }} />;
  },
}));

beforeEach(() => {
  setTestUrl("/");
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

function openKrishna() {
  const view = render(<PortfolioHub />);
  const trigger = view.getByRole("link", { name: "Kṛṣṇa — open the Kṛṣṇa panel" });
  fireEvent.click(trigger);
  return { ...view, trigger };
}

it("opens the unnumbered Kṛṣṇa destination inside the existing right shell", () => {
  const view = render(<PortfolioHub />);
  const right = view.container.querySelector("#portfolio-panel-right");
  expect(view.getByRole("link", { name: "Kṛṣṇa — open the Kṛṣṇa panel" }).getAttribute("data-prefetch")).toBe("false");
  fireEvent.click(view.getByRole("link", { name: "Kṛṣṇa — open the Kṛṣṇa panel" }));
  expect(window.location.pathname + window.location.search).toBe("/?panel=krishna");
  expect(view.getByRole("complementary", { name: "Kṛṣṇa" })).toBe(right);
  expect(right?.getAttribute("data-side")).toBe("right");
  expect(right?.getAttribute("aria-hidden")).toBe("false");
  expect(right?.hasAttribute("inert")).toBe(false);
  expect(view.container.querySelectorAll("aside")).toHaveLength(2);
  expect(view.getAllByRole("complementary")).toHaveLength(1);
  expect(view.container.querySelector("main")?.children).toHaveLength(3);
  expect(view.container.querySelector("main")?.getAttribute("data-panel")).toBe("right");
  expect(view.queryByRole("dialog")).toBeNull();
  const nav = view.getByRole("navigation");
  expect(within(nav).getAllByRole("button")).toHaveLength(8);
  expect(nav.textContent).not.toContain("Kṛṣṇa");
  for (const section of sections) expect(within(nav).getByRole("button", { name: `${section.index} ${section.label}` }).getAttribute("aria-expanded")).toBe("false");
  expect(view.getByRole("heading", { name: "Kṛṣṇa" }).querySelector("span")).toBeNull();
  expect(document.activeElement?.id).toBe("panel-title-right");
});

it("keeps the intrinsic original image before one divider and the unchanged verse", () => {
  const view = openKrishna();
  const panel = view.getByRole("complementary");
  const image = within(panel).getByRole("img", { name: "Kṛṣṇa book cover" });
  expect(decodeURIComponent(image.getAttribute("src")!)).toContain("/images/about/krsna-book-cover.png");
  expect(image.getAttribute("width")).toBe("1086");
  expect(image.getAttribute("height")).toBe("1448");
  expect(image.parentElement?.firstElementChild).toBe(image);
  const divider = within(panel).getByRole("separator");
  expect(image.nextElementSibling).toBe(divider);
  expect(divider.nextElementSibling?.tagName).toBe("ARTICLE");
  expect(within(panel).getByRole("heading", { name: "ŚB 10.21.5" })).toBeTruthy();
  const textLines = (selector: string) => Array.from(panel.querySelector(selector)!.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent?.trim());
  expect(textLines('[lang="sa"]')).toEqual([
    "बर्हापीडं नटवरवपु: कर्णयो: कर्णिकारं",
    "बिभ्रद् वास: कनककपिशं वैजयन्तीं च मालाम् ।",
    "रन्ध्रान् वेणोरधरसुधया पूरयन्गोपवृन्दै-",
    "र्वृन्दारण्यं स्वपदरमणं प्राविशद् गीतकीर्ति: ॥ ५ ॥",
  ]);
  expect(textLines('[lang="sa-Latn"]')).toEqual([
    "barhāpīḍaṁ naṭa-vara-vapuḥ karṇayoḥ karṇikāraṁ",
    "bibhrad vāsaḥ kanaka-kapiśaṁ vaijayantīṁ ca mālām",
    "randhrān veṇor adhara-sudhayāpūrayan gopa-vṛndair",
    "vṛndāraṇyaṁ sva-pada-ramaṇaṁ prāviśad gīta-kīrtiḥ",
  ]);
  expect(within(panel).getByRole("heading", { name: "Translation" })).toBeTruthy();
  expect(panel.querySelector('[lang="en"]')?.textContent).toBe("Wearing a peacock-feather ornament upon His head, blue karṇikāra flowers on His ears, a yellow garment as brilliant as gold, and the Vaijayantī garland, Lord Kṛṣṇa exhibited His transcendental form as the greatest of dancers as He entered the forest of Vṛndāvana, beautifying it with the marks of His footprints. He filled the holes of His flute with the nectar of His lips, and the cowherd boys sang His glories.");
  vi.useFakeTimers();
  fireEvent.load(image);
  act(() => { vi.advanceTimersByTime(6000); });
  expect(within(panel).getByRole("img", { name: "Kṛṣṇa book cover" })).toBe(image);
  expect(image.closest('[hidden], [aria-hidden="true"]')).toBeNull();
});

it.each(["X", "Escape"])("closes with %s to / and returns focus to the wordmark", method => {
  const view = openKrishna();
  if (method === "X") fireEvent.click(view.getByRole("button", { name: "Close kṛṣṇa" }));
  else fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(window.location.pathname + window.location.search).toBe("/");
  expect(view.queryByRole("complementary")).toBeNull();
  expect(document.activeElement).toBe(view.trigger);
});

it("restores Kṛṣṇa with browser Back and Forward in the same shell", async () => {
  const view = openKrishna();
  const panel = view.getByRole("complementary");
  await act(async () => {
    window.history.back();
    await new Promise(resolve => window.addEventListener("popstate", resolve, { once: true }));
  });
  expect(window.location.search).toBe("");
  expect(view.queryByRole("complementary")).toBeNull();
  expect(document.activeElement).toBe(view.trigger);
  await act(async () => {
    window.history.forward();
    await new Promise(resolve => window.addEventListener("popstate", resolve, { once: true }));
  });
  expect(window.location.search).toBe("?panel=krishna");
  expect(view.getByRole("complementary", { name: "Kṛṣṇa" })).toBe(panel);
  expect(document.activeElement?.id).toBe("panel-title-right");
});

it("server renders and restores a direct Kṛṣṇa link", () => {
  setTestUrl("/?panel=krishna");
  const html = new DOMParser().parseFromString(renderToStaticMarkup(<PortfolioHub />), "text/html");
  expect(html.querySelector("#portfolio-panel-right")?.getAttribute("data-open")).toBe("true");
  expect(html.querySelector("#portfolio-panel-left")?.getAttribute("data-open")).toBe("false");
  expect(html.querySelector('#portfolio-panel-right article')?.textContent).toContain("ŚB 10.21.5");
  const view = render(<PortfolioHub />);
  expect(view.getByRole("complementary", { name: "Kṛṣṇa" }).id).toBe("portfolio-panel-right");
  expect(view.container.querySelector("object, video")).toBeNull();
  fireEvent.click(view.getByRole("button", { name: "Close kṛṣṇa" }));
  expect(document.activeElement?.id).toBe("hub-krishna");
});

it.each(sections.filter(section => section.side === "right"))("reuses the right shell when switching between Kṛṣṇa and $label", section => {
  const view = openKrishna();
  const panel = view.getByRole("complementary");
  fireEvent.click(view.getByRole("button", { name: `${section.index} ${section.label}` }));
  expect(window.location.search).toBe(`?panel=${section.id}`);
  expect(view.getByRole("complementary", { name: `${section.index} / ${section.label}` })).toBe(panel);
  expect(view.queryByRole("heading", { name: "ŚB 10.21.5" })).toBeNull();
  fireEvent.click(view.trigger);
  expect(view.getAllByRole("complementary")).toEqual([panel]);
  expect(window.location.search).toBe("?panel=krishna");
  expect(document.activeElement?.id).toBe("panel-title-right");
});

it.each([false, true])("preserves the shared desktop/mobile inert behavior (mobile=%s)", mobile => {
  vi.stubGlobal("matchMedia", () => ({ matches: mobile, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const view = openKrishna();
  const stage = view.getByRole("navigation").parentElement!;
  expect(stage.inert).toBe(mobile);
  expect(view.getByRole("complementary").hasAttribute("inert")).toBe(false);
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(stage.inert).toBe(false);
  expect(document.activeElement).toBe(view.trigger);
});

it("does not render a duplicate Krsna identity link in the shared panel header", () => {
  const view = render(<PortfolioHub />);
  fireEvent.click(view.getByRole("button", { name: "01 About" }));
  expect(
    within(view.getByRole("complementary")).queryByRole("link", { name: "Krsna" }),
  ).toBeNull();
});

it("ignores stale project state for Kṛṣṇa and clears it from the URL", () => {
  expect(portfolioState("krishna", "evidencepatch")).toEqual({ section: "krishna", project: null });
  setTestUrl("/?panel=krishna&project=evidencepatch");
  const view = render(<PortfolioHub />);
  expect(window.location.search).toBe("?panel=krishna");
  expect(view.getByRole("complementary", { name: "Kṛṣṇa" })).toBeTruthy();
  expect(view.container.querySelector("[data-project], video, object")).toBeNull();
});
