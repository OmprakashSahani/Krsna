// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

"use client";

import type { AtlasManifest } from "@/lib/lerobot/atlas-schema/types";
import { applyRuntimeSpacing } from "@/lib/lerobot/coordinates/runtimeSpacing";

import { ARM_COLORS } from "./analyticalPalette";

function BaseReference({
  arm,
  position,
}: {
  arm: "left" | "right";
  position: [number, number, number];
}) {
  const color = ARM_COLORS[arm];
  return (
    <group name={`${arm}-base-reference`} position={position}>
      <mesh position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.07, 0.036, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <axesHelper args={[0.12]} onUpdate={(axes) => axes.setColors("#a65f45", "#6f9d63", "#4f7896")} />
    </group>
  );
}

export function BaseReferenceLayer({
  manifest,
  spacing,
}: {
  manifest: AtlasManifest;
  spacing: number;
}) {
  return (
    <group name="robot-base-references">
      <BaseReference
        arm="left"
        position={applyRuntimeSpacing(
          manifest.coverage.canonicalTransforms.left.translationXyz,
          "left",
          spacing,
          manifest.coverage.armSpacing,
        )}
      />
      <BaseReference
        arm="right"
        position={applyRuntimeSpacing(
          manifest.coverage.canonicalTransforms.right.translationXyz,
          "right",
          spacing,
          manifest.coverage.armSpacing,
        )}
      />
    </group>
  );
}
