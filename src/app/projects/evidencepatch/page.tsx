import { permanentRedirect } from "next/navigation";
import { projectHref } from "@/data/project-details";

export default function EvidencePatchPage() {
  permanentRedirect(projectHref("evidencepatch"));
}
