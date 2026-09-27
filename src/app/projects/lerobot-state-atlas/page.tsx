import { permanentRedirect } from "next/navigation";
import { projectHref } from "@/data/project-details";

export default function LeRobotStateAtlasPage() {
  permanentRedirect(projectHref("lerobot-state-atlas"));
}
