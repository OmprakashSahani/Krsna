// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PortfolioHub } from "./PortfolioHub";

const fetchMock = vi.fn<typeof fetch>();
let unexpectedFetchCalls = 0;
let originalBodyStyle: string | null;
const windowDescriptors = new Map<string, PropertyDescriptor | undefined>();

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  originalBodyStyle = document.body.getAttribute("style");
  unexpectedFetchCalls = 0;
  fetchMock.mockReset().mockImplementation(async () => {
    unexpectedFetchCalls += 1;
    throw new Error("Unexpected fetch: configure a response in this test");
  });
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(async () => {
  try {
    await act(async () => { cleanup(); });
    expect(unexpectedFetchCalls).toBe(0);
  } finally {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (vi.isFakeTimers()) vi.clearAllTimers();
    vi.useRealTimers();
    for (const [name, descriptor] of windowDescriptors) {
      if (descriptor) Object.defineProperty(window, name, descriptor);
      else Reflect.deleteProperty(window, name);
    }
    windowDescriptors.clear();
    if (originalBodyStyle === null) document.body.removeAttribute("style");
    else document.body.setAttribute("style", originalBodyStyle);
  }
});

function fillNote() {
  const view = render(<PortfolioHub />);
  fireEvent.click(screen.getByRole("button", { name: "08 Leave a note" }));
  const message = screen.getByLabelText<HTMLTextAreaElement>("Your note");
  const email = screen.getByLabelText<HTMLInputElement>("EMAIL (OPTIONAL)");
  fireEvent.change(message, { target: { value: "Please keep this draft." } });
  fireEvent.change(email, { target: { value: "visitor@example.test" } });
  const submit = screen.getByRole<HTMLButtonElement>("button", { name: "SEND NOTE" });
  return { ...view, message, email, submit };
}

function setWindowProperty(name: string, value: unknown) {
  windowDescriptors.set(name, Object.getOwnPropertyDescriptor(window, name));
  Object.defineProperty(window, name, { configurable: true, value });
}

function pendingResponse() {
  let resolve!: (response: Response) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Response>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  fetchMock.mockImplementationOnce((_url, options) => {
    const signal = options?.signal;
    const abort = () => reject(new DOMException("Aborted", "AbortError"));
    signal?.addEventListener("abort", abort, { once: true });
    return promise.finally(() => signal?.removeEventListener("abort", abort));
  });
  return { resolve };
}

function requestSignal() {
  const signal = fetchMock.mock.calls[0][1]?.signal;
  expect(signal).toBeInstanceOf(AbortSignal);
  return signal!;
}

function closeNote() {
  fireEvent.click(screen.getByRole("button", { name: "Close leave a note" }));
}

function reopenNote() {
  fireEvent.click(screen.getByRole("button", { name: "08 Leave a note" }));
}

it("preserves the draft and enables retry after a non-JSON 429 response", async () => {
  const response = new Response("Too many requests", {
    status: 429, headers: { "Content-Type": "text/plain" },
  });
  const json = vi.spyOn(response, "json");
  fetchMock.mockResolvedValueOnce(response);
  const { message, email, submit } = fillNote();
  fireEvent.click(submit);

  await waitFor(() => {
    expect(screen.getByRole("status").textContent).toBe(
      "Too many notes sent recently. Please try again in a few minutes.",
    );
    expect(submit.disabled).toBe(false);
  });
  expect(message.value).toBe("Please keep this draft.");
  expect(email.value).toBe("visitor@example.test");
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(json).not.toHaveBeenCalled();
});

it("clears both fields after a successful submission", async () => {
  fetchMock.mockResolvedValueOnce(Response.json({ ok: true }));
  const { message, email, submit } = fillNote();
  fireEvent.click(submit);

  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Note sent."));
  expect(message.value).toBe("");
  expect(email.value).toBe("");
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("preserves the draft and allows retry after a network rejection", async () => {
  fetchMock.mockRejectedValueOnce(new TypeError("Simulated network failure"));
  const { message, email, submit } = fillNote();
  fireEvent.click(submit);

  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Could not send your note. Please try again."));
  expect(message.value).toBe("Please keep this draft.");
  expect(email.value).toBe("visitor@example.test");
  expect(message.readOnly).toBe(false);
  expect(email.readOnly).toBe(false);
  expect(submit.disabled).toBe(false);
  fetchMock.mockResolvedValueOnce(Response.json({ ok: true }));
  fireEvent.click(submit);
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Note sent."));
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("protects pending fields and rejects duplicate form submissions", async () => {
  const response = pendingResponse();
  const { message, email, submit } = fillNote();
  fireEvent.submit(submit.form!);
  expect(submit.disabled).toBe(true);
  expect(message.readOnly).toBe(true);
  expect(email.readOnly).toBe(true);
  expect(submit.form?.getAttribute("aria-busy")).toBe("true");
  expect(screen.getByRole("status").textContent).toBe("Sending…");
  // Dispatch at the form so this exercises the request guard as well as the disabled button.
  fireEvent.submit(submit.form!);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => { response.resolve(Response.json({ ok: true })); });
  expect(screen.getByRole("status").textContent).toBe("Note sent.");
});

it("aborts an in-flight request and clears its timeout on unmount", async () => {
  vi.useFakeTimers();
  const schedule = vi.spyOn(window, "setTimeout");
  const clear = vi.spyOn(window, "clearTimeout");
  pendingResponse();
  const { submit, unmount } = fillNote();
  fireEvent.click(submit);
  const signal = requestSignal();
  const timeoutIndex = schedule.mock.calls.findIndex(([, delay]) => delay === 15000);
  expect(timeoutIndex).toBeGreaterThanOrEqual(0);
  expect(signal.aborted).toBe(false);
  await act(async () => { unmount(); });
  expect(signal.aborted).toBe(true);
  expect(clear).toHaveBeenCalledWith(schedule.mock.results[timeoutIndex].value);
  expect(document.body.style.position).not.toBe("fixed");
});

it("aborts at 15 seconds and restores retry without losing the draft", async () => {
  vi.useFakeTimers();
  pendingResponse();
  const { message, email, submit } = fillNote();
  fireEvent.click(submit);
  const signal = requestSignal();
  await act(async () => { await vi.advanceTimersByTimeAsync(14999); });
  expect(signal.aborted).toBe(false);
  expect(submit.disabled).toBe(true);
  await act(async () => { await vi.advanceTimersByTimeAsync(1); });
  expect(signal.aborted).toBe(true);
  expect(screen.getByRole("status").textContent).toBe("Could not send your note. Please try again.");
  expect(message.value).toBe("Please keep this draft.");
  expect(email.value).toBe("visitor@example.test");
  expect(message.readOnly).toBe(false);
  expect(email.readOnly).toBe(false);
  expect(submit.disabled).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
});

it("preserves an unsent draft across close and reopen", () => {
  const { message, email, submit } = fillNote();
  closeNote();
  expect(screen.queryByRole("complementary")).toBeNull();
  reopenNote();
  expect(message.value).toBe("Please keep this draft.");
  expect(email.value).toBe("visitor@example.test");
  expect(submit.disabled).toBe(false);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("keeps the same request pending across close and reopen", async () => {
  const response = pendingResponse();
  const { message, email, submit } = fillNote();
  fireEvent.click(submit);
  const signal = requestSignal();
  closeNote();
  expect(signal.aborted).toBe(false);
  reopenNote();
  expect(screen.getByRole("status").textContent).toBe("Sending…");
  expect(message.value).toBe("Please keep this draft.");
  expect(email.value).toBe("visitor@example.test");
  expect(submit.disabled).toBe(true);
  fireEvent.submit(submit.form!);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => { response.resolve(Response.json({ ok: true })); });
  expect(screen.getByRole("status").textContent).toBe("Note sent.");
});

it("starts a fresh editable draft when reopening after success", async () => {
  fetchMock.mockResolvedValueOnce(Response.json({ ok: true }));
  const { message, email, submit } = fillNote();
  fireEvent.click(submit);
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Note sent."));
  expect(submit.disabled).toBe(true);
  fireEvent.submit(submit.form!);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  closeNote();
  reopenNote();
  expect(message.value).toBe("");
  expect(email.value).toBe("");
  expect(message.readOnly).toBe(false);
  expect(email.readOnly).toBe(false);
  expect(submit.disabled).toBe(false);
  expect(screen.getByRole("status").textContent).toBe("");
});

it("focuses the note on open and restores the trigger on close", () => {
  // Native Tab order, modality, and inertness require browser verification.
  const { message } = fillNote();
  expect(document.activeElement).toBe(message);
  closeNote();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "08 Leave a note" }));
});

it.each(["close", "unmount"])("leaves body styles and scroll position intact on %s", (action) => {
  const previous = { position: "relative", top: "7px", left: "3px", width: "90%", overflow: "auto", paddingRight: "11px" };
  Object.assign(document.body.style, previous);
  const { unmount } = fillNote();
  for (const [property, value] of Object.entries(previous)) {
    expect(document.body.style[property as keyof typeof previous]).toBe(value);
  }
  if (action === "close") closeNote();
  else unmount();
  for (const [property, value] of Object.entries(previous)) {
    expect(document.body.style[property as keyof typeof previous]).toBe(value);
  }
  expect(window.scrollTo).not.toHaveBeenCalled();
});

it.each(["close", "unmount"])("removes visualViewport listeners and panel overrides on %s", (action) => {
  const viewport = Object.assign(new EventTarget(), { height: 600, offsetTop: 10 });
  setWindowProperty("visualViewport", viewport);
  const add = vi.spyOn(viewport, "addEventListener");
  const remove = vi.spyOn(viewport, "removeEventListener");
  const { unmount } = fillNote();
  const panel = screen.getByRole("complementary");
  expect(panel.style.getPropertyValue("--panel-height")).toBe("600px");
  expect(panel.style.getPropertyValue("--panel-top")).toBe("10px");
  viewport.height = 400;
  viewport.dispatchEvent(new Event("resize"));
  expect(panel.style.getPropertyValue("--panel-height")).toBe("400px");
  viewport.offsetTop = 30;
  viewport.dispatchEvent(new Event("scroll"));
  expect(panel.style.getPropertyValue("--panel-top")).toBe("30px");
  expect(add.mock.calls.map(([type]) => type).sort()).toEqual(["resize", "scroll"]);
  if (action === "close") closeNote();
  else unmount();
  expect(remove.mock.calls).toEqual(add.mock.calls);
  expect(panel.style.getPropertyValue("--panel-height")).toBe("");
  expect(panel.style.getPropertyValue("--panel-top")).toBe("");
});

it("keeps a draft while switching sections and submits an anonymous payload", async () => {
  const { message, email } = fillNote();
  fireEvent.change(email, { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "01 About" }));
  reopenNote();
  expect(message.value).toBe("Please keep this draft.");
  fetchMock.mockResolvedValueOnce(Response.json({ ok: true }));
  fireEvent.click(screen.getByRole("button", { name: "SEND NOTE" }));
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Note sent."));
  expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual({ message: "Please keep this draft." });
});

it("validates empty messages and optional email before sending", () => {
  const { message, email, submit } = fillNote();
  fireEvent.change(message, { target: { value: "   " } });
  fireEvent.click(submit);
  expect(screen.getByRole("status").textContent).toBe("Please write a note first.");
  expect(document.activeElement).toBe(message);
  fireEvent.change(message, { target: { value: "A note" } });
  fireEvent.change(email, { target: { value: "invalid" } });
  fireEvent.click(submit);
  expect(screen.getByRole("status").textContent).toBe("Enter a valid email address or leave it blank.");
  expect(document.activeElement).toBe(email);
  expect(fetchMock).not.toHaveBeenCalled();
});
