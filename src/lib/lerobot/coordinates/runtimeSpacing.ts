// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

import type { Vector3 } from "@/lib/lerobot/atlas-schema/types";

export type Arm = "left" | "right";

export function spacingDeltaY(
  arm: Arm,
  spacing: number,
  manifestSpacing: number,
): number {
  return (arm === "left" ? 1 : -1) * (spacing - manifestSpacing) / 2;
}

export function applyRuntimeSpacing(
  point: Vector3,
  arm: Arm,
  spacing: number,
  manifestSpacing: number,
): Vector3 {
  return [
    point[0],
    point[1] + spacingDeltaY(arm, spacing, manifestSpacing),
    point[2],
  ];
}
