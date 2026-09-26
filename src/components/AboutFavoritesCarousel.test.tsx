// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AboutFavoritesCarousel } from "./AboutFavoritesCarousel";

let reducedMotion = false;
const mediaListeners = new Set<() => void>();
const advance = (milliseconds: number) => act(() => vi.advanceTimersByTime(milliseconds));

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion = false;
  mediaListeners.clear();
  vi.stubGlobal("matchMedia", () => ({
    get matches() { return reducedMotion; },
    addEventListener: (_event: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => mediaListeners.delete(listener),
  }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it("starts at 01, advances every four seconds, loops, and cleans up its timer", () => {
  const view = render(<AboutFavoritesCarousel />);
  const status = () => view.getByRole("status").textContent;
  expect(status()).toMatch(/^01 \/ 09/);
  advance(3999);
  expect(status()).toMatch(/^01 \/ 09/);
  advance(1);
  expect(status()).toMatch(/^02 \/ 09/);
  for (let index = 0; index < 8; index++) advance(4000);
  expect(status()).toMatch(/^01 \/ 09/);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(mediaListeners.size).toBe(0);
});

it("pauses on hover and waits a full interval after leaving", () => {
  const view = render(<AboutFavoritesCarousel />);
  const carousel = view.getByRole("figure");
  advance(3000);
  fireEvent.mouseEnter(carousel);
  advance(12000);
  expect(view.getByRole("status").textContent).toMatch(/^01/);
  fireEvent.mouseLeave(carousel);
  advance(3999);
  expect(view.getByRole("status").textContent).toMatch(/^01/);
  advance(1);
  expect(view.getByRole("status").textContent).toMatch(/^02/);
});

it("pauses while focus moves between any carousel descendants", () => {
  const view = render(<AboutFavoritesCarousel />);
  const link = view.getByRole("link");
  const next = view.getByRole("button", { name: "Next favorite" });
  fireEvent.focus(link);
  advance(8000);
  fireEvent.blur(link, { relatedTarget: next });
  fireEvent.focus(next, { relatedTarget: link });
  fireEvent.click(next);
  advance(8000);
  expect(view.getByRole("status").textContent).toMatch(/^02/);
  fireEvent.blur(next, { relatedTarget: document.body });
  advance(3999);
  expect(view.getByRole("status").textContent).toMatch(/^02/);
  advance(1);
  expect(view.getByRole("status").textContent).toMatch(/^03/);
});

it("resets the countdown after either manual arrow", () => {
  const view = render(<AboutFavoritesCarousel />);
  advance(3000);
  fireEvent.click(view.getByRole("button", { name: "Next favorite" }));
  advance(3999);
  expect(view.getByRole("status").textContent).toMatch(/^02/);
  advance(1);
  expect(view.getByRole("status").textContent).toMatch(/^03/);
  advance(3000);
  fireEvent.click(view.getByRole("button", { name: "Previous favorite" }));
  advance(3999);
  expect(view.getByRole("status").textContent).toMatch(/^02/);
  advance(1);
  expect(view.getByRole("status").textContent).toMatch(/^03/);
});

it("honors reduced motion initially and when the preference changes, preserving manual controls", () => {
  reducedMotion = true;
  const view = render(<AboutFavoritesCarousel />);
  advance(12000);
  expect(view.getByRole("status").textContent).toMatch(/^01/);
  fireEvent.click(view.getByRole("button", { name: "Previous favorite" }));
  expect(view.getByRole("status").textContent).toMatch(/^09/);
  advance(8000);
  expect(view.getByRole("status").textContent).toMatch(/^09/);
  act(() => { reducedMotion = false; mediaListeners.forEach(listener => listener()); });
  advance(4000);
  expect(view.getByRole("status").textContent).toMatch(/^01/);
  act(() => { reducedMotion = true; mediaListeners.forEach(listener => listener()); });
  advance(8000);
  expect(view.getByRole("status").textContent).toMatch(/^01/);
});

it("does not advance in an inactive panel", () => {
  const view = render(<AboutFavoritesCarousel active={false} />);
  advance(12000);
  expect(view.getByRole("status").textContent).toMatch(/^01/);
  view.rerender(<AboutFavoritesCarousel active />);
  advance(4000);
  expect(view.getByRole("status").textContent).toMatch(/^02/);
  view.rerender(<AboutFavoritesCarousel active={false} />);
  advance(8000);
  expect(view.getByRole("status").textContent).toMatch(/^02/);
});
