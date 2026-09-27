import { permanentRedirect } from "next/navigation";
import { projectHref } from "@/data/project-details";

export default function SearchEvalLabPage() {
  permanentRedirect(projectHref("searcheval-lab"));
}
