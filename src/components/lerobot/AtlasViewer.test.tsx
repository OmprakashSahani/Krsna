// @vitest-environment jsdom
// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.
import { cleanup, fireEvent, render, screen, waitFor, within, } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import styles from "./viewer.module.css";
import manifestJson from "../../../public/lerobot-state-atlas/demo-v2/manifest.json";
import coverageJson from "../../../public/lerobot-state-atlas/demo-v2/coverage.json";
import trajectoriesJson from "../../../public/lerobot-state-atlas/demo-v2/trajectories.json";
import { AtlasViewer } from "@/components/lerobot/AtlasViewer";
import { decodeCoverage, decodeEpisodeVideos, decodeManifest, decodeTrajectories, } from "@/lib/lerobot/atlas-schema/validate";
import { loadEpisodeVideos, loadTrajectories, } from "@/lib/lerobot/data/loadBundle";
import type { CoverageMetric } from "@/lib/lerobot/data/metrics";
import { prepareCoverage } from "@/lib/lerobot/data/prepareCoverage";
import type { AtlasData, CoveragePayload, EpisodeVideoPayload, TrajectoryEpisode, TrajectoryEpisodeOrientations, TrajectoryEpisodeRecordedGripperValues, TrajectoryPayload, } from "@/lib/lerobot/atlas-schema/types";
import type { VoxelSelection } from "@/lib/lerobot/data/radiusQuery";
const manifest = decodeManifest(manifestJson);
const manifestWithVideos = decodeManifest({
    ...manifestJson,
    payloads: [
        ...manifestJson.payloads,
        {
            kind: "episode-videos",
            filename: "episode-videos.json",
            required: false,
            encoding: "json",
            byteSize: 1234,
            sha256: "b".repeat(64),
        },
    ],
});
const episodeVideos = decodeEpisodeVideos({
    schema: {
        name: "lerobot-state-atlas.browser-data",
        major: 1,
        minor: 2,
    },
    defaultCameraId: "top",
    cameras: [
        {
            cameraId: "left",
            datasetFeature: "observation.images.left_wrist",
            label: "Left wrist camera",
            width: 224,
            height: 224,
        },
        {
            cameraId: "top",
            datasetFeature: "observation.images.top",
            label: "Top camera",
            width: 224,
            height: 224,
        },
    ],
    episodes: [0, 1].map((episodeId) => ({
        episodeId,
        videos: [
            {
                cameraId: "left",
                filename: `media/episode-${episodeId}/left.mp4`,
                mimeType: "video/mp4",
                fromTimestampSeconds: 0,
                toTimestampSeconds: 20,
                byteSize: 100,
                sha256: `${episodeId + 1}`.repeat(64),
            },
            {
                cameraId: "top",
                filename: `media/episode-${episodeId}/top.mp4`,
                mimeType: "video/mp4",
                fromTimestampSeconds: 0,
                toTimestampSeconds: 20,
                byteSize: 100,
                sha256: `${episodeId + 3}`.repeat(64),
            },
        ],
    })),
});
const coverage = decodeCoverage(coverageJson);
const positionOnlyTrajectories = decodeTrajectories(trajectoriesJson, manifest);
const preparedArmsForTest = prepareCoverage(manifest, coverage);
const setSpacingMock = vi.fn();
let activeManifest = manifest;
let activeCoverage: CoveragePayload = coverage;
let activePreparedArms = preparedArmsForTest;
let activeSelection: VoxelSelection | null = {
    arm: "left",
    voxelEntryIndex: 0,
    exportedCenter: Array.from(preparedArmsForTest[0].centers.slice(0, 3)) as [
        number,
        number,
        number
    ],
};
let activeRadius = 0.05;
let activeSpacing = manifest.coverage.armSpacing;
let activeMetric: CoverageMetric = "visits";
let viewerCanvasProps: {
    data: AtlasData;
    episode: TrajectoryEpisode | null;
    orientationEpisode: TrajectoryEpisodeOrientations | null;
    recordedGripperEpisode: TrajectoryEpisodeRecordedGripperValues | null;
    playbackFrame: number;
} | null = null;
function trajectoriesWithOptionalState(orientationStatus: "available" | "degraded" = "available", gripperStatus: "available" | "degraded" = "available"): TrajectoryPayload {
    return {
        ...positionOnlyTrajectories,
        orientation: orientationStatus === "degraded"
            ? { status: "degraded", warning: "Invalid orientation fixture." }
            : {
                status: "available",
                data: {
                    episodes: positionOnlyTrajectories.episodes.map((episode) => ({
                        episodeId: episode.episodeId,
                        leftOrientationsXyzw: episode.frameIndices.map(() => [
                            episode.episodeId === 0 ? 0 : 1,
                            0,
                            0,
                            episode.episodeId === 0 ? 1 : 0,
                        ]),
                        rightOrientationsXyzw: episode.frameIndices.map(() => [
                            0,
                            0,
                            1,
                            0,
                        ]),
                    })),
                },
            },
        gripper: gripperStatus === "degraded"
            ? { status: "degraded", warning: "Invalid gripper fixture." }
            : {
                status: "available",
                data: {
                    episodes: positionOnlyTrajectories.episodes.map((episode) => ({
                        episodeId: episode.episodeId,
                        leftRecordedGripperValues: episode.frameIndices.map((_, index) => episode.episodeId === 0 ? -0.5 - index : -10 - index),
                        rightRecordedGripperValues: episode.frameIndices.map((_, index) => episode.episodeId === 0 ? index + 2.25 : index + 100),
                    })),
                },
            },
    };
}
function currentViewerCanvasProps() {
    if (viewerCanvasProps === null) {
        throw new Error("ViewerCanvas has not rendered.");
    }
    return viewerCanvasProps;
}
function rankedEpisodeRow(episodeId: number): HTMLElement {
    const ranking = screen.getByRole("list", {
        name: /Uncommon-space episode ranking/,
    });
    const row = within(ranking).getByText(`Episode ${episodeId}`).closest("li");
    if (row === null)
        throw new Error(`Episode ${episodeId} row was not rendered.`);
    return row;
}
function coverageForEpisodeIds(episodeIds: number[]): CoveragePayload {
    return {
        schema: coverage.schema,
        arms: (["left", "right"] as const).map((arm) => ({
            arm,
            toolLink: "tool0",
            voxelIndices: [[arm === "left" ? 0 : 1, 0, 0]],
            visitCounts: [episodeIds.length],
            episodeCounts: [episodeIds.length],
            episodeIdOffsets: [0, episodeIds.length],
            episodeIds: [...episodeIds],
            statistics: {
                voxelEntryCount: 1,
                minimumVisitCount: episodeIds.length,
                maximumVisitCount: episodeIds.length,
                minimumEpisodeCount: episodeIds.length,
                maximumEpisodeCount: episodeIds.length,
            },
        })),
    };
}
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    setSpacingMock.mockClear();
    activeManifest = manifest;
    activeCoverage = coverage;
    activePreparedArms = preparedArmsForTest;
    activeSelection = {
        arm: "left",
        voxelEntryIndex: 0,
        exportedCenter: Array.from(preparedArmsForTest[0].centers.slice(0, 3)) as [
            number,
            number,
            number
        ],
    };
    activeRadius = 0.05;
    activeSpacing = manifest.coverage.armSpacing;
    activeMetric = "visits";
    viewerCanvasProps = null;
    vi.mocked(loadTrajectories).mockResolvedValue(decodeTrajectories(trajectoriesJson, manifest));
    vi.mocked(loadEpisodeVideos).mockResolvedValue(episodeVideos);
});
vi.mock("@/components/lerobot/AtlasDataProvider", () => ({
    useAtlasData: () => ({
        status: "ready",
        data: {
            manifest: activeManifest,
            coverage: activeCoverage,
            preparedArms: activePreparedArms,
        },
    }),
}));
vi.mock("@/components/lerobot/ViewerStore", () => ({
    useViewerStore: () => ({
        leftVisible: true,
        rightVisible: true,
        cameraResetToken: 0,
        metric: activeMetric,
        spacing: activeSpacing,
        radius: activeRadius,
        selection: activeSelection,
        autoRotate: false,
        toggleArm: vi.fn(),
        resetCamera: vi.fn(),
        setMetric: vi.fn(),
        setSpacing: setSpacingMock,
        setRadius: vi.fn(),
        selectVoxel: vi.fn(),
        clearSelection: vi.fn(),
        setAutoRotate: vi.fn(),
    }),
}));
vi.mock("@/components/lerobot/ViewerCanvas", () => ({
    ViewerCanvas: (props: NonNullable<typeof viewerCanvasProps>) => {
        viewerCanvasProps = props;
        return <div data-testid="viewer-canvas"/>;
    },
}));
vi.mock("@/lib/lerobot/data/loadBundle", () => ({
    episodeVideoAssetUrl: (filename: string) => `/lerobot-state-atlas/demo-v2/${filename}`,
    loadEpisodeVideos: vi.fn(async () => episodeVideos),
    loadTrajectories: vi.fn(async () => decodeTrajectories(trajectoriesJson, manifest)),
}));
describe("accessible viewer content", () => {
    it("labels viewer controls and preserves the spacing disclosure", () => {
        render(<AtlasViewer />);
        expect(screen.getByText("demo-v2 / episodes 0–9")?.isConnected).toBe(true);
        const viewerControls = screen.getByRole("complementary", {
            name: "Viewer controls",
        });
        const episodeAnalysis = screen.getByRole("complementary", {
            name: "Episode analysis",
        });
        expect(viewerControls?.isConnected).toBe(true);
        expect(episodeAnalysis?.isConnected).toBe(true);
        expect(viewerControls).not.toBe(episodeAnalysis);
        expect(screen.getAllByRole("heading", { name: "Episode analysis" })).toHaveLength(1);
        expect(within(episodeAnalysis).getByLabelText("Episode scoring scope")?.isConnected).toBe(true);
        expect(within(episodeAnalysis).getByRole("list", {
            name: "Uncommon-space episode ranking for entire coverage",
        })?.isConnected).toBe(true);
        expect(within(episodeAnalysis).queryByLabelText("Metric")?.isConnected).not.toBe(true);
        expect(within(episodeAnalysis).queryByRole("heading", { name: "Scene" })?.isConnected).not.toBe(true);
        expect(within(episodeAnalysis).queryByRole("heading", { name: "Robot setup" })?.isConnected).not.toBe(true);
        expect(within(viewerControls).getByLabelText("Metric")?.isConnected).toBe(true);
        expect(screen.getByText("schema v1.2")?.isConnected).toBe(true);
        expect(screen.getByRole("button", { name: "Reset camera" })?.isConnected).toBe(true);
        expect(screen.getByLabelText("Metric")?.isConnected).toBe(true);
        expect(screen.getByLabelText("Visits color range")?.isConnected).toBe(true);
        expect(screen.getByLabelText("Query radius: 0.050 m")?.isConnected).toBe(true);
        expect(screen.getByRole("button", { name: "Clear selection" })?.isConnected).toBe(true);
        const loadPlayback = screen.getByRole("button", { name: "Load playback" });
        expect(loadPlayback?.isConnected).toBe(true);
        const mediaToggle = screen.getByRole("button", {
            name: "Open synchronized media",
        });
        const playbackActions = mediaToggle.closest(`.${styles["playback-primary-actions"]}`);
        expect(playbackActions).not.toBeNull();
        expect(playbackActions?.contains(loadPlayback)).toBe(true);
        expect(loadPlayback.classList.contains(styles["playback-primary-action"])).toBe(true);
        expect(mediaToggle.classList.contains(styles["playback-primary-action"])).toBe(true);
        expect(mediaToggle.getAttribute("aria-expanded")).toBe("false");
        expect(mediaToggle.getAttribute("aria-controls")).toBe("synchronized-media-panel");
        expect(screen.queryByText("Synchronized media is not included in this bundle.")?.isConnected).not.toBe(true);
        expect(screen.queryByRole("region", { name: "Synchronized media" })?.isConnected).not.toBe(true);
        expect(screen.getByTestId("viewer-visuals").querySelector("#synchronized-media-panel")).toBeNull();
        expect(loadEpisodeVideos).not.toHaveBeenCalled();
        expect(loadTrajectories).not.toHaveBeenCalled();
        expect(screen.queryByRole("video")?.isConnected).not.toBe(true);
        expect(screen.getByLabelText("Auto rotate")?.isConnected).toBe(true);
        expect(screen.getByRole("heading", { name: "Robot setup" })?.isConnected).toBe(true);
        expect((screen.getByLabelText("Arm spacing (metres)") as HTMLInputElement).valueAsNumber).toBe(0.8);
        expect(screen.getByLabelText(/Arm spacing slider/)?.isConnected).toBe(true);
        expect(screen.getByRole("button", { name: "Apply spacing" })?.isConnected).toBe(true);
        expect(screen.getByRole("button", { name: "Restore manifest spacing" })?.isConnected).toBe(true);
        expect(screen.getByText("Manifest baseline: 0.80 m")?.isConnected).toBe(true);
        expect(screen.getByText(manifest.coverage.spacingDisclosure)?.isConnected).toBe(true);
        expect(screen.getByText("Requested dataset ref")?.isConnected).toBe(true);
        expect(screen.getByText("Resolved HF commit")?.isConnected).toBe(true);
        expect(screen.getByText("Repository HEAD")?.isConnected).toBe(true);
        expect(screen.queryByText("Uncommitted exporter source")?.isConnected).not.toBe(true);
        expect(screen.queryByText(manifest.exporter.sourceDescription)?.isConnected).not.toBe(true);
    });
    it("opens a request-free synchronized-media empty state without video metadata", async () => {
        render(<AtlasViewer />);
        const openButton = screen.getByRole("button", {
            name: "Open synchronized media",
        });
        fireEvent.click(openButton);
        expect(screen.getByRole("button", { name: "Close synchronized media" }).getAttribute("aria-expanded")).toBe("true");
        const region = screen.getByRole("region", { name: "Synchronized media" });
        expect(region?.isConnected).toBe(true);
        expect(within(region).getByText("Synchronized media is not included in this bundle.").getAttribute("role")).toBe("note");
        expect(within(region).getAllByText("Synchronized media is not included in this bundle.")).toHaveLength(1);
        expect(screen.getByRole("region", { name: "Trajectory playback" }).contains(screen.getByRole("region", { name: "Synchronized media" }))).toBe(true);
        expect(loadEpisodeVideos).not.toHaveBeenCalled();
        expect(loadTrajectories).not.toHaveBeenCalled();
        expect(region.querySelector("video")?.isConnected).not.toBe(true);
        expect(within(region).queryByRole("button", {
            name: "Retry synchronized media",
        })?.isConnected).not.toBe(true);
        expect(within(region).queryByRole("button", {
            name: "Close synchronized media panel",
        })?.isConnected).not.toBe(true);
        expect(screen.getAllByRole("button", { name: "Close synchronized media" })).toHaveLength(1);
        region.focus();
        fireEvent.keyDown(region, { key: "Escape" });
        await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open synchronized media" })));
        expect(screen.queryByRole("region", { name: "Synchronized media" })?.isConnected).not.toBe(true);
        expect(screen.getByTestId("viewer-visuals").querySelector("#synchronized-media-panel")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Open synchronized media" }));
        expect(screen.getByRole("region", { name: "Synchronized media" })?.isConnected).toBe(true);
        expect(loadEpisodeVideos).not.toHaveBeenCalled();
        expect(loadTrajectories).not.toHaveBeenCalled();
    });
    it("fully renders a synthetic 100-episode ranking in its scroll region", () => {
        const episodeIds = Array.from({ length: 100 }, (_, index) => index);
        activeManifest = {
            ...manifest,
            bundleId: "pilot-100-batch32",
            dataset: {
                ...manifest.dataset,
                episodeIds,
                episodeCount: episodeIds.length,
            },
        };
        activeCoverage = coverageForEpisodeIds(episodeIds);
        activePreparedArms = prepareCoverage(activeManifest, activeCoverage);
        activeSelection = null;
        render(<AtlasViewer />);
        const analysis = screen.getByRole("complementary", {
            name: "Episode analysis",
        });
        const ranking = within(analysis).getByRole("list", {
            name: "Uncommon-space episode ranking for entire coverage",
        });
        expect(within(ranking).getAllByRole("listitem")).toHaveLength(100);
        expect(ranking.parentElement?.classList.contains(styles["episode-analysis-results"])).toBe(true);
        expect(screen.getAllByRole("complementary", { name: "Episode analysis" })).toHaveLength(1);
        expect(screen.getAllByRole("list", {
            name: "Uncommon-space episode ranking for entire coverage",
        })).toHaveLength(1);
    });
    it("keeps ranking order stable across coverage metric changes", () => {
        const { rerender } = render(<AtlasViewer />);
        const rankedEpisodes = () => within(screen.getByRole("list", {
            name: "Uncommon-space episode ranking for entire coverage",
        }))
            .getAllByRole("listitem")
            .map((item) => within(item).getByText(/Episode \d+/).textContent);
        const visitsRanking = rankedEpisodes();
        activeMetric = "episodes";
        rerender(<AtlasViewer />);
        expect((screen.getByLabelText("Metric") as HTMLInputElement).value).toBe(String("episodes"));
        expect(rankedEpisodes()).toEqual(visitsRanking);
    });
    it("derives stable bundle and episode labeling from coverage metadata", async () => {
        activeManifest = {
            ...manifest,
            bundleId: "pilot-selection",
        };
        activeSelection = null;
        const { rerender } = render(<AtlasViewer />);
        const expectedLabel = "pilot-selection / episodes 0–9";
        expect(screen.getByText(expectedLabel)?.isConnected).toBe(true);
        fireEvent.click(screen.getByRole("button", { name: "Load playback" }));
        expect((await screen.findByLabelText("Episode") as HTMLInputElement).value).toBe(String("0"));
        expect(screen.getByText(expectedLabel)?.isConnected).toBe(true);
        activeRadius = 0.3;
        activeSpacing = 1.2;
        rerender(<AtlasViewer />);
        expect(screen.getByText(expectedLabel)?.isConnected).toBe(true);
    });
    it("presents an accessible global uncommon-space ranking by default", () => {
        render(<AtlasViewer />);
        expect(screen.getByRole("heading", { name: "Uncommon-space episodes" })?.isConnected).toBe(true);
        expect((screen.getByLabelText("Episode scoring scope") as HTMLInputElement).value).toBe(String("coverage"));
        const list = screen.getByRole("list", {
            name: "Uncommon-space episode ranking for entire coverage",
        });
        expect(within(list).getAllByRole("listitem")).toHaveLength(manifest.dataset.episodeCount);
        const firstResult = within(list).getAllByRole("listitem")[0];
        expect(within(firstResult).getByText(/Episode \d+/)?.isConnected).toBe(true);
        expect(within(firstResult).getByText(/Uncommonness \d+\.\d \/ 100/)?.isConnected).toBe(true);
        expect(within(firstResult).getByText("Arm-specific entries touched")?.isConnected).toBe(true);
        expect(within(firstResult).getByText("Scoped entries touched")?.isConnected).toBe(true);
        expect(within(firstResult).getByText("Distinct episodes represented")?.isConnected).toBe(true);
        expect(screen.getByText(/Scores use distinct-episode frequency/).textContent.replace(/\s+/g, " ")).toContain("Raw visit counts are a separate metric.");
        const limitations = screen.getByText(/Scores describe only this exported coverage set/);
        expect(limitations.textContent.replace(/\s+/g, " ")).toContain("not the full dataset or physical workspace generally");
        expect(limitations.textContent.replace(/\s+/g, " ")).toContain("not a probability, percentile, task-quality judgment, or anomaly label");
        expect(screen.getByText(/episodes ranked for entire coverage/).getAttribute("aria-live")).toBe("polite");
        expect(screen.getByRole("button", { name: "Check playback availability" })?.isConnected).toBe(true);
        expect(screen.getAllByText("Playback availability not loaded.")).toHaveLength(manifest.dataset.episodeCount);
        expect(loadTrajectories).not.toHaveBeenCalled();
    });
    it("checks ranked playback availability with one shared lazy request", async () => {
        render(<AtlasViewer />);
        fireEvent.click(screen.getByRole("button", { name: "Check playback availability" }));
        expect(screen.getByText("Checking playback availability…").getAttribute("aria-busy")).toBe("true");
        expect(loadTrajectories).toHaveBeenCalledTimes(1);
        expect((await within(rankedEpisodeRow(0)).findByText("Playback available"))?.isConnected).toBe(true);
        const availableButton = within(rankedEpisodeRow(0)).getByRole("button", {
            name: "Open Episode 0 playback",
        });
        expect(availableButton.getAttribute("aria-describedby")).toBe("episode-0-playback-status");
        expect(within(rankedEpisodeRow(2)).getByText("Coverage evidence only — trajectory not exported.")?.isConnected).toBe(true);
        expect(within(rankedEpisodeRow(2)).queryByRole("button", {
            name: "Open Episode 2 playback",
        })?.isConnected).not.toBe(true);
    });
    it("shares one in-flight request between both activation actions", async () => {
        let resolveTrajectories!: (payload: TrajectoryPayload) => void;
        vi.mocked(loadTrajectories).mockReturnValueOnce(new Promise((resolve) => {
            resolveTrajectories = resolve;
        }));
        render(<AtlasViewer />);
        const checkButton = screen.getByRole("button", {
            name: "Check playback availability",
        });
        const loadButton = screen.getByRole("button", { name: "Load playback" });
        fireEvent.click(checkButton);
        fireEvent.click(loadButton);
        fireEvent.click(checkButton);
        expect(loadTrajectories).toHaveBeenCalledTimes(1);
        resolveTrajectories(positionOnlyTrajectories);
        expect((await screen.findByLabelText("Episode") as HTMLInputElement).value).toBe(String("0"));
    });
    it("opens the exact ranked episode and preserves speed and loop", async () => {
        render(<AtlasViewer />);
        fireEvent.click(screen.getByRole("button", { name: "Check playback availability" }));
        await within(rankedEpisodeRow(1)).findByText("Playback available");
        fireEvent.change(screen.getByLabelText("Playback speed"), {
            target: { value: "2" },
        });
        fireEvent.click(screen.getByLabelText("Loop playback"));
        fireEvent.change(screen.getByLabelText("Timeline"), {
            target: { value: "10" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Play" }));
        fireEvent.click(within(rankedEpisodeRow(1)).getByRole("button", {
            name: "Open Episode 1 playback",
        }));
        expect((screen.getByLabelText("Episode") as HTMLInputElement).value).toBe(String("1"));
        expect(document.activeElement).toBe(screen.getByLabelText("Episode"));
        expect((screen.getByLabelText("Timeline") as HTMLInputElement).value).toBe(String("0"));
        expect(screen.getByRole("button", { name: "Play" })?.isConnected).toBe(true);
        expect((screen.getByLabelText("Playback speed") as HTMLInputElement).value).toBe(String("2"));
        expect((screen.getByLabelText("Loop playback") as HTMLInputElement).checked).toBe(true);
        expect(currentViewerCanvasProps().episode?.episodeId).toBe(1);
        expect(currentViewerCanvasProps().orientationEpisode?.episodeId).toBe(1);
        expect(currentViewerCanvasProps().recordedGripperEpisode?.episodeId).toBe(1);
    });
    it("keeps rankings honest after loading failure and permits retry", async () => {
        vi.mocked(loadTrajectories)
            .mockRejectedValueOnce(new Error("Trajectory fixture failed."))
            .mockResolvedValueOnce(positionOnlyTrajectories);
        render(<AtlasViewer />);
        fireEvent.click(screen.getByRole("button", { name: "Check playback availability" }));
        expect((await screen.findByText("Trajectory fixture failed.")).getAttribute("role")).toBe("alert");
        expect(screen.getAllByText("Playback availability could not be loaded.")).toHaveLength(manifest.dataset.episodeCount);
        expect(screen.getByRole("list", {
            name: "Uncommon-space episode ranking for entire coverage",
        })?.isConnected).toBe(true);
        expect(screen.queryByText("Coverage evidence only — trajectory not exported.")?.isConnected).not.toBe(true);
        fireEvent.click(screen.getByRole("button", { name: "Retry playback availability" }));
        expect((await screen.findByLabelText("Episode") as HTMLInputElement).value).toBe(String("0"));
        expect(loadTrajectories).toHaveBeenCalledTimes(2);
    });
    it("disables radius scoring and provides help before voxel selection", () => {
        activeSelection = null;
        render(<AtlasViewer />);
        expect(screen.getByRole("option", { name: "Selected radius" }).matches(":disabled")).toBe(true);
        expect(screen.getByText(/Select an occupied voxel to score episodes within a radius/)?.isConnected).toBe(true);
    });
    it("updates local uncommon scores and returns safely to global scope", async () => {
        activeRadius = 0;
        const { rerender } = render(<AtlasViewer />);
        const scope = screen.getByLabelText("Episode scoring scope");
        const globalRanking = screen.getByRole("list", {
            name: "Uncommon-space episode ranking for entire coverage",
        });
        const globalEpisodes = within(globalRanking)
            .getAllByRole("listitem")
            .map((item) => within(item).getByText(/Episode \d+/).textContent);
        fireEvent.change(scope, { target: { value: "radius" } });
        expect(screen.getByText(/Radius 0\.000 m/).textContent.replace(/\s+/g, " ")).toMatch(/arm-specific entry/);
        const initialSummary = screen.getByText(/episodes? ranked for selected radius/)
            .textContent;
        activeRadius = 0.3;
        rerender(<AtlasViewer />);
        expect((screen.getByLabelText("Episode scoring scope") as HTMLInputElement).value).toBe(String("radius"));
        expect(screen.getByText(/episodes? ranked for selected radius/).textContent).not.toBe(initialSummary);
        fireEvent.change(screen.getByLabelText("Episode scoring scope"), {
            target: { value: "coverage" },
        });
        const restoredRanking = screen.getByRole("list", {
            name: "Uncommon-space episode ranking for entire coverage",
        });
        expect(within(restoredRanking)
            .getAllByRole("listitem")
            .map((item) => within(item).getByText(/Episode \d+/).textContent)).toEqual(globalEpisodes);
        fireEvent.change(screen.getByLabelText("Episode scoring scope"), {
            target: { value: "radius" },
        });
        activeSelection = null;
        rerender(<AtlasViewer />);
        await waitFor(() => expect((screen.getByLabelText("Episode scoring scope") as HTMLInputElement).value).toBe(String("coverage")));
        expect(screen.getByRole("option", { name: "Selected radius" }).matches(":disabled")).toBe(true);
    });
    it("shows an honest empty selected-radius state", () => {
        activePreparedArms = preparedArmsForTest.map((arm) => ({
            ...arm,
            centers: new Float32Array(),
            visits: new Uint32Array(),
            episodeCounts: new Uint32Array(),
            instanceLookup: [],
        }));
        render(<AtlasViewer />);
        fireEvent.change(screen.getByLabelText("Episode scoring scope"), {
            target: { value: "radius" },
        });
        expect(screen.getByText("No episode evidence exists in the current radius.")?.isConnected).toBe(true);
        expect(screen.queryByRole("list", {
            name: "Uncommon-space episode ranking for selected radius",
        })?.isConnected).not.toBe(true);
    });
    it("explains the defined zero score for one coverage episode", () => {
        activeManifest = {
            ...manifest,
            dataset: {
                ...manifest.dataset,
                episodeIds: [0],
                episodeCount: 1,
            },
        };
        activeCoverage = {
            schema: coverage.schema,
            arms: (["left", "right"] as const).map((arm) => ({
                arm,
                toolLink: "tool0",
                voxelIndices: [[0, 0, 0]],
                visitCounts: [1],
                episodeCounts: [1],
                episodeIdOffsets: [0, 1],
                episodeIds: [0],
                statistics: {
                    voxelEntryCount: 1,
                    minimumVisitCount: 1,
                    maximumVisitCount: 1,
                    minimumEpisodeCount: 1,
                    maximumEpisodeCount: 1,
                },
            })),
        };
        activePreparedArms = prepareCoverage(activeManifest, activeCoverage);
        activeSelection = null;
        render(<AtlasViewer />);
        expect(screen.getByText(/Relative uncommonness is unavailable with one coverage episode/).textContent.replace(/\s+/g, " ")).toContain("scores are defined as zero");
        expect(screen.getByText("Uncommonness 0.0 / 100")?.isConnected).toBe(true);
    });
    it("applies, clamps, rejects, and restores arm spacing", () => {
        render(<AtlasViewer />);
        const input = screen.getByLabelText("Arm spacing (metres)");
        const applyButton = screen.getByRole("button", {
            name: "Apply spacing",
        });
        fireEvent.change(input, { target: { value: "1.15" } });
        fireEvent.click(applyButton);
        expect(setSpacingMock).toHaveBeenLastCalledWith(1.15);
        fireEvent.change(input, { target: { value: "2.00" } });
        fireEvent.click(applyButton);
        expect(setSpacingMock).toHaveBeenLastCalledWith(1.4);
        const callCountBeforeInvalidInput = setSpacingMock.mock.calls.length;
        fireEvent.change(input, { target: { value: "" } });
        fireEvent.click(applyButton);
        expect(setSpacingMock).toHaveBeenCalledTimes(callCountBeforeInvalidInput);
        expect((input as HTMLInputElement).valueAsNumber).toBe(0.8);
        fireEvent.click(screen.getByRole("button", { name: "Restore manifest spacing" }));
        expect(setSpacingMock).toHaveBeenLastCalledWith(manifest.coverage.armSpacing);
    });
    it("exposes accessible playback controls after lazy activation", async () => {
        render(<AtlasViewer />);
        screen.getByRole("button", { name: "Load playback" }).click();
        expect((await screen.findByLabelText("Episode") as HTMLInputElement).value).toBe(String("0"));
        expect(loadTrajectories).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("button", { name: "Play" })?.isConnected).toBe(true);
        expect(screen.getByRole("button", { name: "Restart" })?.isConnected).toBe(true);
        expect(screen.getByLabelText("Timeline")?.isConnected).toBe(true);
        expect(screen.getByLabelText("Playback speed")?.isConnected).toBe(true);
        expect(screen.getByLabelText("Loop playback")?.isConnected).toBe(true);
        expect(screen.getByRole("group", { name: "Recorded raw gripper values" })?.isConnected).toBe(true);
        expect(currentViewerCanvasProps().orientationEpisode?.episodeId).toBe(0);
        expect(currentViewerCanvasProps().recordedGripperEpisode?.episodeId).toBe(0);
    });
    it("threads matching required and optional episodes together", async () => {
        vi.mocked(loadTrajectories).mockResolvedValueOnce(trajectoriesWithOptionalState());
        render(<AtlasViewer />);
        fireEvent.click(screen.getByRole("button", { name: "Load playback" }));
        await screen.findByLabelText("Episode");
        expect(currentViewerCanvasProps().episode?.episodeId).toBe(0);
        expect(currentViewerCanvasProps().orientationEpisode?.episodeId).toBe(0);
        expect(currentViewerCanvasProps().recordedGripperEpisode?.episodeId).toBe(0);
        expect(currentViewerCanvasProps().orientationEpisode
            ?.leftOrientationsXyzw[0]).toEqual([0, 0, 0, 1]);
        const initialRawValues = screen.getByRole("group", {
            name: "Recorded raw gripper values",
        });
        expect(within(initialRawValues).getByText("-0.5")?.isConnected).toBe(true);
        expect(within(initialRawValues).getByText("2.25")?.isConnected).toBe(true);
        expect(within(initialRawValues).getByText(/Symbolic display only/).textContent.replace(/\s+/g, " ")).toContain("Values are raw and device-specific; physical jaw width is not calibrated, and open/closed polarity is not established.");
        fireEvent.change(screen.getByLabelText("Timeline"), {
            target: { value: "1" },
        });
        const advancedRawValues = screen.getByRole("group", {
            name: "Recorded raw gripper values",
        });
        expect(within(advancedRawValues).getByText("-1.5")?.isConnected).toBe(true);
        expect(within(advancedRawValues).getByText("3.25")?.isConnected).toBe(true);
        fireEvent.change(screen.getByLabelText("Episode"), {
            target: { value: "1" },
        });
        expect(currentViewerCanvasProps().episode?.episodeId).toBe(1);
        expect(currentViewerCanvasProps().orientationEpisode?.episodeId).toBe(1);
        expect(currentViewerCanvasProps().recordedGripperEpisode?.episodeId).toBe(1);
        expect(currentViewerCanvasProps().orientationEpisode
            ?.leftOrientationsXyzw[0]).toEqual([1, 0, 0, 0]);
        const switchedRawValues = screen.getByRole("group", {
            name: "Recorded raw gripper values",
        });
        expect(within(switchedRawValues).getByText("-10")?.isConnected).toBe(true);
        expect(within(switchedRawValues).getByText("100")?.isConnected).toBe(true);
    });
    it.each([
        ["orientation", "gripper"],
        ["gripper", "orientation"],
    ] as const)("threads available %s data when %s is degraded", async (availableCapability, degradedCapability) => {
        vi.mocked(loadTrajectories).mockResolvedValueOnce(trajectoriesWithOptionalState(degradedCapability === "orientation" ? "degraded" : "available", degradedCapability === "gripper" ? "degraded" : "available"));
        render(<AtlasViewer />);
        fireEvent.click(screen.getByRole("button", { name: "Load playback" }));
        await screen.findByLabelText("Episode");
        expect(currentViewerCanvasProps().episode?.episodeId).toBe(0);
        expect(availableCapability === "orientation"
            ? currentViewerCanvasProps().orientationEpisode?.episodeId
            : currentViewerCanvasProps().recordedGripperEpisode?.episodeId).toBe(0);
        expect(degradedCapability === "orientation"
            ? currentViewerCanvasProps().orientationEpisode
            : currentViewerCanvasProps().recordedGripperEpisode).toBeNull();
        if (availableCapability === "gripper") {
            expect(screen.getByRole("group", {
                name: "Recorded raw gripper values",
            })?.isConnected).toBe(true);
        }
        else {
            expect(screen.queryByRole("group", {
                name: "Recorded raw gripper values",
            })?.isConnected).not.toBe(true);
            expect(screen.getByText("Invalid gripper fixture.").getAttribute("role")).toBe("note");
        }
    });
    it("exposes synchronized video and switches camera and episode sources", async () => {
        activeManifest = manifestWithVideos;
        render(<AtlasViewer />);
        expect(screen.getByText("schema v1.2")?.isConnected).toBe(true);
        const openMedia = screen.getByRole("button", {
            name: "Open synchronized media",
        });
        expect(openMedia.getAttribute("aria-expanded")).toBe("false");
        expect(openMedia.getAttribute("aria-controls")).toBe("synchronized-media-panel");
        expect(screen.queryByRole("region", { name: "Synchronized media" })?.isConnected).not.toBe(true);
        expect(screen.getByTestId("viewer-visuals").querySelector("#synchronized-media-panel")).toBeNull();
        expect(loadEpisodeVideos).not.toHaveBeenCalled();
        fireEvent.click(openMedia);
        expect(loadEpisodeVideos).toHaveBeenCalledTimes(1);
        expect(loadTrajectories).not.toHaveBeenCalled();
        expect(screen.queryByLabelText("Timeline")?.isConnected).not.toBe(true);
        expect(screen.getByRole("button", { name: "Close synchronized media" }).getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByRole("region", { name: "Synchronized media" })?.isConnected).toBe(true);
        expect(screen.getByRole("region", { name: "Trajectory playback" }).contains(screen.getByRole("region", { name: "Synchronized media" }))).toBe(true);
        expect((await screen.findByText("Load trajectory playback to select synchronized episode media."))?.isConnected).toBe(true);
        expect(screen.queryByRole("button", {
            name: "Close synchronized media panel",
        })?.isConnected).not.toBe(true);
        expect(screen.getAllByRole("button", { name: "Close synchronized media" })).toHaveLength(1);
        const loadPlayback = screen.getByRole("button", { name: "Load playback" });
        const playbackActions = loadPlayback.closest(`.${styles["playback-primary-actions"]}`);
        expect(loadPlayback.classList.contains(styles["playback-primary-action"])).toBe(true);
        expect(screen.getByRole("button", { name: "Close synchronized media" }).classList.contains(styles["playback-primary-action"])).toBe(true);
        fireEvent.click(loadPlayback);
        const video = await screen.findByLabelText("Top camera synchronized episode video");
        expect(screen.queryByRole("button", { name: "Load playback" })?.isConnected).not.toBe(true);
        expect(playbackActions?.contains(screen.getByRole("button", { name: "Close synchronized media" }))).toBe(true);
        expect(screen.getByRole("button", { name: "Close synchronized media" }).classList.contains(styles["playback-primary-action"])).toBe(true);
        expect(video.getAttribute("src")).toBe("/lerobot-state-atlas/demo-v2/media/episode-0/top.mp4");
        expect(video.getAttribute("controls")).toBeNull();
        expect(video.getAttribute("playsinline")).not.toBeNull();
        expect(video.getAttribute("preload")).toBe("metadata");
        fireEvent.change(screen.getByLabelText("Camera"), {
            target: { value: "left" },
        });
        expect(screen.getByLabelText("Left wrist camera synchronized episode video").getAttribute("src")).toBe("/lerobot-state-atlas/demo-v2/media/episode-0/left.mp4");
        fireEvent.change(screen.getByLabelText("Episode"), {
            target: { value: "1" },
        });
        expect(screen.getByLabelText("Left wrist camera synchronized episode video").getAttribute("src")).toBe("/lerobot-state-atlas/demo-v2/media/episode-1/left.mp4");
        fireEvent.click(screen.getByRole("button", { name: "Close synchronized media" }));
        await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open synchronized media" })));
        expect(screen.queryByRole("region", { name: "Synchronized media" })?.isConnected).not.toBe(true);
        expect(screen.queryByLabelText("Left wrist camera synchronized episode video")?.isConnected).not.toBe(true);
        expect(screen.getByTestId("viewer-visuals").querySelector("#synchronized-media-panel")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Open synchronized media" }));
        expect(loadEpisodeVideos).toHaveBeenCalledTimes(1);
        expect(screen.getByLabelText("Left wrist camera synchronized episode video").getAttribute("src")).toBe("/lerobot-state-atlas/demo-v2/media/episode-1/left.mp4");
    });
    it("reports media loading without starting playback", async () => {
        activeManifest = manifestWithVideos;
        let resolveMetadata: ((value: EpisodeVideoPayload) => void) | undefined;
        vi.mocked(loadEpisodeVideos).mockReturnValueOnce(new Promise((resolve) => {
            resolveMetadata = resolve;
        }));
        render(<AtlasViewer />);
        fireEvent.click(screen.getByRole("button", { name: "Open synchronized media" }));
        expect(within(screen.getByRole("region", { name: "Synchronized media" })).getByRole("status").textContent.replace(/\s+/g, " ")).toContain("Loading synchronized video metadata");
        expect(loadTrajectories).not.toHaveBeenCalled();
        expect(screen.queryByLabelText("Timeline")?.isConnected).not.toBe(true);
        resolveMetadata?.(episodeVideos);
        expect((await screen.findByText("Load trajectory playback to select synchronized episode media."))?.isConnected).toBe(true);
    });
    it("discloses a sparse episode-video selection honestly", async () => {
        activeManifest = manifestWithVideos;
        vi.mocked(loadEpisodeVideos).mockResolvedValueOnce({
            ...episodeVideos,
            episodes: episodeVideos.episodes.filter((item) => item.episodeId === 0),
        });
        render(<AtlasViewer />);
        fireEvent.click(screen.getByRole("button", { name: "Open synchronized media" }));
        fireEvent.click(screen.getByRole("button", { name: "Load playback" }));
        await screen.findByLabelText("Top camera synchronized episode video");
        fireEvent.change(screen.getByLabelText("Episode"), {
            target: { value: "1" },
        });
        expect(screen.getByText("No synchronized top camera video is available for this episode.")?.isConnected).toBe(true);
        expect(screen.queryByLabelText("Top camera synchronized episode video")?.isConnected).not.toBe(true);
    });
    it("keeps trajectory controls when optional video metadata fails and retries", async () => {
        activeManifest = manifestWithVideos;
        vi.mocked(loadEpisodeVideos).mockRejectedValueOnce(new Error("Invalid video metadata."));
        render(<AtlasViewer />);
        fireEvent.click(screen.getByRole("button", { name: "Open synchronized media" }));
        expect((await screen.findByText(/Synchronized episode video is unavailable/))?.isConnected).toBe(true);
        expect(loadEpisodeVideos).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole("button", { name: "Load playback" }));
        expect((await screen.findByLabelText("Timeline"))?.isConnected).toBe(true);
        expect(screen.getByRole("button", { name: "Play" })?.isConnected).toBe(true);
        expect(loadEpisodeVideos).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole("button", { name: "Retry synchronized media" }));
        expect(loadEpisodeVideos).toHaveBeenCalledTimes(2);
        expect((await screen.findByLabelText("Top camera synchronized episode video"))?.isConnected).toBe(true);
    });
});
