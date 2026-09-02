import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./globals.css";

const description = "Portfolio of Omprakash Sahani, an ML systems and software engineer working across evaluation, performance, and distributed systems.";

export const metadata: Metadata = {
  title: { default: "Omprakash Sahani — ML Systems Engineer", template: "%s — Omprakash Sahani" },
  description,
  authors: [{ name: "Omprakash Sahani" }],
  creator: "Omprakash Sahani",
  openGraph: { type: "website", title: "Omprakash Sahani — ML Systems Engineer", description, siteName: "Omprakash Sahani" },
  twitter: { card: "summary", title: "Omprakash Sahani — ML Systems Engineer", description },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="site-shell">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
