import type { Metadata, Viewport } from "next";
import { PortfolioHub } from "@/components/portfolio/PortfolioHub";
import { projectMetadata } from "@/data/project-details";
import { portfolioState } from "@/components/portfolio/navigation-state";
import { krishnaMetadata } from "@/data/krishna";

export const viewport: Viewport = { colorScheme: "light", themeColor: "#F3F0E7" };

type HomeProps = { searchParams: Promise<{ panel?: string | string[]; project?: string | string[] }> };

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const { panel, project } = await searchParams;
  const state = portfolioState(panel, project);
  if (state.section === "krishna") return krishnaMetadata;
  return state.project ? projectMetadata(state.project) : { alternates: { canonical: "/" } };
}

export default async function HomePage({
  searchParams,
}: HomeProps) {
  // Resolve request state before rendering so deep links are server rendered.
  await searchParams;
  return <PortfolioHub />;
}
