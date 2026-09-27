import { expect, it } from "vitest";
import { generateMetadata } from "./page";
import { projectDetails, projectHref, type ProjectSlug } from "@/data/project-details";
import { portfolioState } from "@/components/portfolio/navigation-state";

it.each(Object.keys(projectDetails) as ProjectSlug[])("exposes the existing %s metadata on the canonical deep link", async slug => {
  const metadata = await generateMetadata({ searchParams: Promise.resolve({ panel: "work", project: slug }) });
  const { title, description } = projectDetails[slug];
  expect(metadata.title).toBe(title);
  expect(metadata.description).toBe(description);
  expect(metadata.alternates).toEqual({ canonical: projectHref(slug) });
  expect(metadata.openGraph).toEqual({ type: "website", title: `${title} — Omprakash Sahani`, description, siteName: "Omprakash Sahani" });
  expect(metadata.twitter).toEqual({ card: "summary", title: `${title} — Omprakash Sahani`, description });
});

it.each([{}, { panel: "work" }, { panel: "about", project: "evidencepatch" }, { project: "invalid" }])("keeps normal homepage metadata unchanged for %j", async search => {
  expect(await generateMetadata({ searchParams: Promise.resolve(search) })).toEqual({ alternates: { canonical: "/" } });
});

it("handles project-only links, stale sections, invalid and repeated parameters", () => {
  expect(portfolioState(undefined, "evidencepatch")).toEqual({ section: "work", project: "evidencepatch" });
  expect(portfolioState("about", "evidencepatch")).toEqual({ section: "about", project: null });
  expect(portfolioState("invalid", "invalid")).toEqual({ section: null, project: null });
  expect(portfolioState(["work", "about"], ["evidencepatch", "searcheval-lab"])).toEqual({ section: null, project: null });
});
