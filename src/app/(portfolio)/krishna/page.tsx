import { permanentRedirect } from "next/navigation";
import { krishnaMetadata } from "@/data/krishna";

export const metadata = krishnaMetadata;

export default async function KrishnaPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (Object.keys(await searchParams).length > 0) permanentRedirect("/krishna");
  // The shared portfolio layout renders the existing route-owned Kṛṣṇa panel.
  return null;
}
