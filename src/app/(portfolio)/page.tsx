import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { projectMetadata } from "@/data/project-details";
import { portfolioState } from "@/components/portfolio/navigation-state";
import { krishnaMetadata } from "@/data/krishna";

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
  const { panel, project } = await searchParams;
  if (portfolioState(panel, project).section === "krishna") permanentRedirect("/krishna");
  // The shared layout owns the shell so route changes preserve panels and focus.
  return null;
}
