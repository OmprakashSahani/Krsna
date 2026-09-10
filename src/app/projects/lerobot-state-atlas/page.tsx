import type { Metadata } from "next";
import { ViewerEntry } from "@/components/lerobot/ViewerEntry";

const title = "LeRobot State Atlas — Omprakash Sahani";
const description = "Analyze and visualize state-space and tool-workspace coverage in LeRobot datasets.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/projects/lerobot-state-atlas" },
  openGraph: { type: "website", title, description, siteName: "Omprakash Sahani" },
  twitter: { card: "summary", title, description },
};

export default function LeRobotStateAtlasPage() {
  return (
    <main id="main-content">
      <h1>LeRobot State Atlas</h1>
      <p>{description}</p>
      <ViewerEntry />
    </main>
  );
}
