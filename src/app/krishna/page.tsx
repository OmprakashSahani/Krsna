import { permanentRedirect } from "next/navigation";
import { sectionHref } from "@/components/portfolio/navigation-state";

export default function KrishnaPage() {
  permanentRedirect(sectionHref("krishna"));
}
