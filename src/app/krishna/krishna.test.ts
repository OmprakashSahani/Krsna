import { expect, it, vi } from "vitest";
import KrishnaPage from "./page";
import { generateMetadata } from "../page";

vi.mock("next/navigation", () => ({ permanentRedirect: (url: string) => { throw new Error(`308:${url}`); } }));

it("permanently redirects /krishna into the homepage panel architecture", () => {
  expect(() => KrishnaPage()).toThrow("308:/?panel=krishna");
});

it.each([undefined, "evidencepatch"])("preserves all Kṛṣṇa metadata with project=%s", async project => {
  const description = "ŚB 10.21.5 in Devanagari and transliteration, with an English translation.";
  expect(await generateMetadata({ searchParams: Promise.resolve({ panel: "krishna", project }) })).toEqual({
    title: "ŚB 10.21.5 — Kṛṣṇa",
    description,
    alternates: { canonical: "/krishna" },
    openGraph: { type: "website", title: "ŚB 10.21.5 — Kṛṣṇa — Omprakash Sahani", description, siteName: "Omprakash Sahani" },
    twitter: { card: "summary", title: "ŚB 10.21.5 — Kṛṣṇa — Omprakash Sahani", description },
  });
});

it("does not apply Kṛṣṇa metadata to repeated or invalid panel parameters", async () => {
  for (const panel of [["krishna", "about"], "invalid", undefined]) {
    expect(await generateMetadata({ searchParams: Promise.resolve({ panel }) })).toEqual({ alternates: { canonical: "/" } });
  }
});
