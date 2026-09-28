// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SidePanel } from "./SidePanel";

const section = { id: "about", label: "About", side: "left" } as const;
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each(["focus", "close", "unmount"])("handles delayed panel visibility on %s", action => {
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (frame: number) => frames.delete(frame));
  const advanceFrame = () => act(() => {
    const pending = [...frames];
    frames.clear();
    pending.forEach(([, callback]) => callback(0));
  });
  // Browsers ignore focus while CSS visibility is still hidden during opening.
  let visible = false;
  vi.stubGlobal("getComputedStyle", () => ({ visibility: visible ? "visible" : "hidden" }));
  const view = render(<SidePanel section={section} open onClose={() => {}}><p>About content</p></SidePanel>);
  const heading = view.container.querySelector("h2")!;
  expect(document.activeElement).not.toBe(heading);
  expect(frames.size).toBe(1);
  advanceFrame();
  expect(frames.size).toBe(1);
  if (action === "close") view.rerender(<SidePanel section={section} open={false} onClose={() => {}}><p>About content</p></SidePanel>);
  else if (action === "unmount") view.unmount();
  else { visible = true; advanceFrame(); }
  expect(frames.size).toBe(0);
  expect(document.activeElement === heading).toBe(action === "focus");
});
