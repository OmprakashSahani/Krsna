import { describe, expect, it, vi } from "vitest";
import manifestJson from "../../../public/lerobot-state-atlas/demo-v2/manifest.json";
import coverageJson from "../../../public/lerobot-state-atlas/demo-v2/coverage.json";
import { decodeManifest, decodeCoverage } from "@/lib/lerobot/atlas-schema/validate";
import { prepareCoverage } from "@/lib/lerobot/data/prepareCoverage";
import { VoxelLayer } from "./VoxelLayer";

const selectVoxel = vi.hoisted(() => vi.fn());
// Inspect the actual mesh's picking callback without claiming DOM renders WebGL.
vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useMemo: (factory: () => unknown) => factory(),
  useRef: () => ({ current: null }),
  useEffect: vi.fn(),
}));
vi.mock("./ViewerStore", () => ({ useViewerStore: () => ({ metric: "visits", selectVoxel }) }));

describe("voxel mesh picking contract", () => {
  it.each([0, 1] as const)("keeps arm %s instance identity and unshifted Float32 center for the query", (armIndex) => {
    selectVoxel.mockClear();
    const manifest = decodeManifest(manifestJson);
    const arm = prepareCoverage(manifest, decodeCoverage(coverageJson))[armIndex];
    const element = VoxelLayer({ data: arm, range: [1, 100], voxelSize: 0.02, visible: true, spacing: 1.2, manifestSpacing: 0.8 });
    const stopPropagation = vi.fn();
    element.props.onClick({ stopPropagation, instanceId: 0 });
    expect(stopPropagation).toHaveBeenCalledOnce();
    expect(selectVoxel).toHaveBeenCalledWith(arm.arm, 0, Array.from(arm.centers.slice(0, 3)));
    expect(element.props.position[1]).toBeCloseTo(armIndex === 0 ? 0.2 : -0.2);
    expect(element.props.args[2]).toBe(armIndex === 0 ? 660 : 564);
    element.props.onClick({ stopPropagation });
    expect(selectVoxel).toHaveBeenCalledOnce();
  });
});
