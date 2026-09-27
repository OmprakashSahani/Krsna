import { isProjectSlug, type ProjectSlug } from "@/data/project-details";
import { panelDefinitions, type PanelId } from "./sections";

export function portfolioState(panel: unknown, project: unknown): { section: PanelId | null; project: ProjectSlug | null } {
  const section = panelDefinitions.find(item => item.id === panel)?.id ?? null;
  const slug = isProjectSlug(project) ? project : null;
  // A project-only deep link implies Work; unrelated sections ignore stale projects.
  if (slug && (!section || section === "work")) return { section: "work", project: slug };
  return { section, project: null };
}

export function sectionHref(section: PanelId | null) {
  return section ? `/?panel=${section}` : "/";
}
