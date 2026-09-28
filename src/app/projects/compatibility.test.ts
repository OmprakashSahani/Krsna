import { expect, it, vi } from "vitest";
import ProjectsPage from "./page";
import LeRobotPage from "./lerobot-state-atlas/page";
import SearchEvalPage from "./searcheval-lab/page";
import EvidencePatchPage from "./evidencepatch/page";
import AboutPage from "../about/page";
import ResumePage from "../resume/page";

vi.mock("next/navigation", () => ({
  permanentRedirect: (url: string) => { throw new Error(`308:${url}`); },
  redirect: (url: string) => { throw new Error(`307:${url}`); },
}));

it.each([
  [AboutPage, "/?panel=about"],
  [ResumePage, "/?panel=resume"],
] as const)("preserves the temporary compatibility redirect for %s", (route, url) => {
  expect(() => route()).toThrow(`307:${url}`);
});

it.each([
  [ProjectsPage, "/?panel=work"],
  [LeRobotPage, "/?panel=work&project=lerobot-state-atlas"],
  [SearchEvalPage, "/?panel=work&project=searcheval-lab"],
  [EvidencePatchPage, "/?panel=work&project=evidencepatch"],
] as const)("redirects %s to its canonical panel URL", (route, url) => {
  expect(() => route()).toThrow(`308:${url}`);
});
