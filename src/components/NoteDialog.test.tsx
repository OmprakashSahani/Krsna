// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { NoteDialog } from "./NoteDialog";

const fetchMock = vi.fn<typeof fetch>();
let unexpectedFetchCalls = 0;
const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");

beforeAll(() => {
  // jsdom does not implement showModal; only emulate opening for these form tests.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) { this.open = true; },
  });
});

afterAll(() => {
  if (originalShowModal) Object.defineProperty(HTMLDialogElement.prototype, "showModal", originalShowModal);
  else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
});

beforeEach(() => {
  unexpectedFetchCalls = 0;
  fetchMock.mockReset().mockImplementation(async () => {
    unexpectedFetchCalls += 1;
    throw new Error("Unexpected fetch: configure a response in this test");
  });
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  try {
    cleanup();
    expect(unexpectedFetchCalls).toBe(0);
  } finally {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
});

function fillNote() {
  render(<NoteDialog />);
  fireEvent.click(screen.getByRole("button", { name: "Leave a note" }));
  const message = screen.getByLabelText<HTMLTextAreaElement>("Your note");
  const email = screen.getByLabelText<HTMLInputElement>("EMAIL (OPTIONAL)");
  fireEvent.change(message, { target: { value: "Please keep this draft." } });
  fireEvent.change(email, { target: { value: "visitor@example.test" } });
  const submit = screen.getByRole<HTMLButtonElement>("button", { name: "SEND NOTE" });
  return { message, email, submit };
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
