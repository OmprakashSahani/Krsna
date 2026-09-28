import { expect, it, vi } from "vitest";
import { permanentRedirect } from "next/navigation";
import KrishnaPage, { metadata } from "../(portfolio)/krishna/page";
import HomePage, { generateMetadata } from "../(portfolio)/page";
import PortfolioLayout from "../(portfolio)/layout";
import { PortfolioHub } from "@/components/portfolio/PortfolioHub";
import { sectionHref } from "@/components/portfolio/navigation-state";
import { sections } from "@/components/portfolio/sections";
import { krishnaMetadata } from "@/data/krishna";

vi.mock("next/navigation", () => ({ permanentRedirect: vi.fn((url: string) => { throw new Error(`308:${url}`); }) }));

it("renders /krishna through the single shared PortfolioHub without redirecting", async () => {
  vi.mocked(permanentRedirect).mockClear();
  const page = await KrishnaPage({ searchParams: Promise.resolve({}) });
  expect(page).toBeNull();
  const layout = PortfolioLayout({ children: page });
  expect(layout.props.children[0].type).toBe(PortfolioHub);
  expect(permanentRedirect).not.toHaveBeenCalled();
});

it.each([
  { query: { project: "evidencepatch" } },
  { query: { panel: "work", project: "evidencepatch" } },
  { query: { panel: ["krishna", "about"], project: "evidencepatch" } },
  { query: { anything: "value" } },
  { query: { anything: "" } },
  { query: { anything: ["first", "second"] } },
])("permanently normalizes every query-bearing Kṛṣṇa URL: $query", async ({ query }) => {
  await expect(KrishnaPage({ searchParams: Promise.resolve(query) })).rejects.toThrow("308:/krishna");
});

it("exports the existing Kṛṣṇa metadata directly on the canonical route", () => {
  expect(metadata).toBe(krishnaMetadata);
  expect(metadata.alternates).toEqual({ canonical: "/krishna" });
});

it.each([undefined, "evidencepatch"])("preserves all Kṛṣṇa metadata with project=%s", async project => {
  const description = "ŚB 10.21.5 in Devanagari and transliteration, with an English translation.";
  const expected = {
    title: "ŚB 10.21.5 — Kṛṣṇa",
    description,
    alternates: { canonical: "/krishna" },
    openGraph: { type: "website", title: "ŚB 10.21.5 — Kṛṣṇa — Omprakash Sahani", description, siteName: "Omprakash Sahani" },
    twitter: { card: "summary", title: "ŚB 10.21.5 — Kṛṣṇa — Omprakash Sahani", description },
  };
  expect(metadata).toEqual(expected);
  expect(await generateMetadata({ searchParams: Promise.resolve({ panel: "krishna", project }) })).toEqual(expected);
});

it.each([undefined, "evidencepatch", "invalid", ["evidencepatch", "searcheval-lab"]].map(project => ({ project })))("permanently redirects legacy Kṛṣṇa queries with project=$project", async ({ project }) => {
  await expect(HomePage({ searchParams: Promise.resolve({ panel: "krishna", project }) })).rejects.toThrow("308:/krishna");
});

it.each([["krishna", "about"], ["krishna", "krishna"], "invalid", undefined].map(panel => ({ panel })))("rejects repeated or invalid panel parameters: $panel", async ({ panel }) => {
  expect(await HomePage({ searchParams: Promise.resolve({ panel }) })).toBeNull();
  expect(await generateMetadata({ searchParams: Promise.resolve({ panel }) })).toEqual({ alternates: { canonical: "/" } });
});

it("preserves the project fallback for ambiguous panels without redirecting to Kṛṣṇa", async () => {
  const searchParams = Promise.resolve({ panel: ["krishna", "about"], project: "evidencepatch" });
  expect(await HomePage({ searchParams })).toBeNull();
  expect((await generateMetadata({ searchParams })).alternates).toEqual({ canonical: "/?panel=work&project=evidencepatch" });
});

it("uses the canonical Kṛṣṇa href and the closed homepage href", () => {
  expect(sectionHref("krishna")).toBe("/krishna");
  expect(sectionHref(null)).toBe("/");
});

it.each(sections)("preserves the regular $id href", section => {
  expect(sectionHref(section.id)).toBe(`/?panel=${section.id}`);
});
