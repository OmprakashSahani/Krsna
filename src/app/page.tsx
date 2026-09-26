import type { Metadata, Viewport } from "next";
import { PortfolioHub } from "@/components/portfolio/PortfolioHub";
import type { SectionId } from "@/components/portfolio/sections";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const viewport: Viewport = { colorScheme: "light", themeColor: "#F3F0E7" };

const allowedPanels = new Set<SectionId>([
  "about",
  "resume",
  "work",
  "favorites",
  "research",
  "writing",
  "contact",
  "note",
]);

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ panel?: string }>;
}) {
  const { panel } = await searchParams;
  const initialSection =
    panel && allowedPanels.has(panel as SectionId)
      ? (panel as SectionId)
      : null;

  return <PortfolioHub initialSection={initialSection} />;
}
