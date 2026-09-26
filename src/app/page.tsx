import type { Metadata, Viewport } from "next";
import { PortfolioHub } from "@/components/portfolio/PortfolioHub";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const viewport: Viewport = { colorScheme: "light", themeColor: "#F3F0E7" };

export default function HomePage() {
  return <PortfolioHub />;
}
