import { expect, it, vi } from "vitest";
import ProjectsPage from "./page";
import LeRobotPage from "./lerobot-state-atlas/page";
import SearchEvalPage from "./searcheval-lab/page";
import EvidencePatchPage from "./evidencepatch/page";

vi.mock("next/navigation", () => ({ permanentRedirect: (url: string) => { throw new Error(`308:${url}`); } }));

it.each([
  [ProjectsPage, "/?panel=work"],
  [LeRobotPage, "/?panel=work&project=lerobot-state-atlas"],
  [SearchEvalPage, "/?panel=work&project=searcheval-lab"],
  [EvidencePatchPage, "/?panel=work&project=evidencepatch"],
] as const)("redirects %s to its canonical panel URL", (route, url) => {
  expect(() => route()).toThrow(`308:${url}`);
});
