import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import manifestJson from "../../../../public/lerobot-state-atlas/demo-v2/manifest.json";
import coverageJson from "../../../../public/lerobot-state-atlas/demo-v2/coverage.json";
import trajectoriesJson from "../../../../public/lerobot-state-atlas/demo-v2/trajectories.json";
import { decodeCoverage, decodeManifest, decodeTrajectories } from "../atlas-schema/validate";
import { prepareCoverage, voxelCenter } from "../data/prepareCoverage";
import { scoreUncommonEpisodes } from "../data/uncommonEpisodes";
import { selectRecordedPlaybackSample } from "../playback/controller";

const manifest = decodeManifest(manifestJson);
const coverage = decodeCoverage(coverageJson);

describe("pinned demo-v2 regression", () => {
  it.each([
    ["manifest.json", 2900, "ad5415af2240b6279f2da4b3277286378d73aef5e5162c717d1fc4d5a16e5a6b"],
    ["coverage.json", 26564, "1903ee315de47413d7dd42e85d50a83c5825b002563e4cce3f304de8bc51d90c"],
    ["trajectories.json", 333950, "eb58ee7806fe1c3f1b682be8a03a2594ff53dd523f74202be90f1018baa5d476"],
  ])("preserves exact upstream bytes for %s", (filename, size, sha256) => {
    const bytes = readFileSync(new URL(`../../../../public/lerobot-state-atlas/demo-v2/${filename}`, import.meta.url));
    expect(bytes.byteLength).toBe(size);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(sha256);
    const reference = manifest.payloads.find((payload) => payload.filename === filename);
    if (reference) {
      expect(reference.byteSize).toBe(size);
      expect(reference.sha256).toBe(sha256);
    }
  });

  it("retains exact frame, per-arm visit, entry, cell, and episode totals", () => {
    expect(manifest.dataset.episodeIds).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(manifest.dataset.episodeCount).toBe(10);
    expect(manifest.dataset.datasetFrameCount).toBe(5124);
    expect(manifest.dataset.fps).toBe(50);
    expect(manifest.totals).toEqual({
      datasetFrameCount: 5124,
      toolPointVisitCount: 10248,
      armVoxelEntryCount: 1224,
      uniqueSharedGridCellCount: 1205,
    });
    expect(coverage.arms.map((arm) => arm.voxelIndices.length)).toEqual([660, 564]);
    expect(coverage.arms.map((arm) => arm.visitCounts.reduce((sum, value) => sum + value, 0))).toEqual([5124, 5124]);
    const cells = new Set(coverage.arms.flatMap((arm) => arm.voxelIndices.map((index) => index.join(","))));
    expect(cells.size).toBe(1205);
    expect([...new Set(coverage.arms.flatMap((arm) => arm.episodeIds))].sort((a, b) => a - b)).toEqual(manifest.dataset.episodeIds);
  });

  it("keeps episodes 2–9 as coverage evidence without synthesized playback", () => {
    const trajectories = decodeTrajectories(trajectoriesJson, manifest);
    expect(trajectories.episodes.map((episode) => [episode.episodeId, episode.frameIndices.length])).toEqual([[0, 515], [1, 445]]);
    const available = new Set(trajectories.episodes.map((episode) => episode.episodeId));
    const scores = scoreUncommonEpisodes({ coverage, episodeCount: 10, allowedEpisodeIds: manifest.dataset.episodeIds });
    expect(scores.map((score) => score.episodeId).filter((id) => !available.has(id)).sort((a, b) => a - b)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    expect(manifest.payloads.some((payload) => payload.kind === "episode-videos")).toBe(false);
    expect(manifest.trajectoryState?.gripper.physicalJawWidthCalibrated).toBe(false);
    expect(manifest.trajectoryState?.gripper.polarityEstablished).toBe(false);
  });

  it("preserves episode identity and matching optional state when export order changes", () => {
    const raw = structuredClone(trajectoriesJson);
    raw.episodes.reverse();
    // Non-contiguous source IDs must survive decoding; array indices are not IDs.
    raw.episodes[0].episodeId = 9;
    raw.episodes[1].episodeId = 4;
    const decoded = decodeTrajectories(raw, manifest);
    expect(decoded.episodes.map((episode) => episode.episodeId)).toEqual([9, 4]);
    expect(decoded.orientation.status).toBe("available");
    expect(decoded.gripper.status).toBe("available");
    if (decoded.orientation.status !== "available" || decoded.gripper.status !== "available") throw new Error("Expected optional state");
    for (const expected of raw.episodes) {
      const episode = decoded.episodes.find((candidate) => candidate.episodeId === expected.episodeId)!;
      const orientation = decoded.orientation.data.episodes.find((candidate) => candidate.episodeId === expected.episodeId)!;
      const gripper = decoded.gripper.data.episodes.find((candidate) => candidate.episodeId === expected.episodeId)!;
      const sample = selectRecordedPlaybackSample(episode, 12.9, orientation, gripper);
      expect(sample.index).toBe(12);
      expect(sample.left.position).toEqual(expected.leftPositionsXyz[12]);
      expect(sample.right.position).toEqual(expected.rightPositionsXyz[12]);
      expect(sample.left.orientationXyzw).toEqual(expected.leftOrientationsXyzw[12]);
      expect(sample.right.orientationXyzw).toEqual(expected.rightOrientationsXyzw[12]);
      expect(sample.left.recordedGripperValue).toBe(expected.leftRecordedGripperValues[12]);
      expect(sample.right.recordedGripperValue).toBe(expected.rightRecordedGripperValues[12]);
    }
  });

  it("computes centers with nonzero origins and negative indices, retaining Float32 storage", () => {
    expect(voxelCenter([-2, 0, 3], [1, -1, 0.5], 0.2)).toEqual([0.7, -0.9, 1.2000000000000002]);
    const prepared = prepareCoverage(manifest, coverage);
    for (const arm of prepared) {
      expect(arm.centers).toBeInstanceOf(Float32Array);
      expect(arm.visits).toBeInstanceOf(Uint32Array);
      expect(arm.episodeCounts).toBeInstanceOf(Uint32Array);
    }
  });
});
