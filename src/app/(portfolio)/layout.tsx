import type { Viewport } from "next";
import { PortfolioHub } from "@/components/portfolio/PortfolioHub";

export const viewport: Viewport = { colorScheme: "light", themeColor: "#F3F0E7" };
// Both routes server-render their URL state, including direct Kṛṣṇa arrivals.
export const dynamic = "force-dynamic";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <><PortfolioHub />{children}</>;
}
