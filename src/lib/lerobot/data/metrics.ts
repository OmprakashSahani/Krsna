// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

import type { PreparedVoxelArm } from "@/lib/lerobot/atlas-schema/types";

export type CoverageMetric = "visits" | "log-visits" | "episodes";

export const metricLabels: Record<CoverageMetric, string> = {
  visits: "Visits",
  "log-visits": "Log visits",
  episodes: "Distinct episodes",
};

export function metricValue(
  arm: PreparedVoxelArm,
  index: number,
  metric: CoverageMetric,
): number {
  if (metric === "visits") return arm.visits[index];
  if (metric === "log-visits") return Math.log1p(arm.visits[index]);
  return arm.episodeCounts[index];
}

export function metricDomain(
  arms: PreparedVoxelArm[],
  metric: CoverageMetric,
): [number, number] {
  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;
  for (const arm of arms) {
    for (let index = 0; index < arm.visits.length; index += 1) {
      const value = metricValue(arm, index, metric);
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    }
  }
  return [minimum, maximum];
}
