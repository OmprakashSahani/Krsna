// @vitest-environment jsdom

import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import manifest from "../../../public/lerobot-state-atlas/demo-v2/manifest.json";
import coverage from "../../../public/lerobot-state-atlas/demo-v2/coverage.json";
import trajectories from "../../../public/lerobot-state-atlas/demo-v2/trajectories.json";
import { AtlasDataProvider } from "./AtlasDataProvider";
import { AtlasViewer } from "./AtlasViewer";
import { ViewerStore, useViewerStore } from "./ViewerStore";
import type { ViewerCanvas } from "./ViewerCanvas";

let canvasProps: Parameters<typeof ViewerCanvas>[0];
vi.mock("./ViewerCanvas", () => ({ ViewerCanvas: (props: Parameters<typeof ViewerCanvas>[0]) => {
  canvasProps = props;
  const viewer = useViewerStore();
  return <div>
    <button type="button" onClick={() => viewer.selectVoxel("left", 0, Array.from(props.data.preparedArms[0].centers.slice(0, 3)) as [number, number, number])}>Select test voxel</button>
    <output data-testid="scene-state">{JSON.stringify({ left: viewer.leftVisible, right: viewer.rightVisible, spacing: viewer.spacing, autoRotate: viewer.autoRotate, reset: viewer.cameraResetToken })}</output>
  </div>;
} }));

const fetcher = vi.fn<typeof fetch>();
beforeEach(() => {
  fetcher.mockImplementation(async (input) => {
    const path = String(input);
    if (path.endsWith("manifest.json")) return Response.json(manifest);
    if (path.endsWith("coverage.json")) return Response.json(coverage);
    if (path.endsWith("trajectories.json")) return Response.json(trajectories);
    throw new Error(`Unexpected request: ${path}`);
  });
  vi.stubGlobal("fetch", fetcher);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); fetcher.mockReset(); });

function mount() {
  return render(<StrictMode><AtlasDataProvider><ViewerStore><AtlasViewer /></ViewerStore></AtlasDataProvider></StrictMode>);
}
async function ready() { mount(); await screen.findByRole("heading", { name: "Workspace coverage" }); }
function state() { return JSON.parse(screen.getByTestId("scene-state").textContent!); }
const trajectoryRequests = () => fetcher.mock.calls.filter(([url]) => String(url).endsWith("trajectories.json"));

describe("viewer with real data provider, store, and analytical modules", () => {
  it("loads manifest then coverage once in Strict Mode without trajectories or media", async () => {
    mount();
    expect(screen.getByRole("status").textContent).toContain("Loading pinned atlas data");
    await screen.findByRole("heading", { name: "Workspace coverage" });
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual(["/lerobot-state-atlas/demo-v2/manifest.json", "/lerobot-state-atlas/demo-v2/coverage.json"]);
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open synchronized media" }));
    expect(screen.getByText("Synchronized media is not included in this bundle.")).toBeTruthy();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("reports a failed initial load accessibly", async () => {
    fetcher.mockResolvedValueOnce(new Response(null, { status: 503 }));
    mount();
    expect((await screen.findByRole("alert")).textContent).toContain("Unable to load atlas manifest");
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("switches metrics with one cross-arm domain independent of visibility", async () => {
    await ready();
    fireEvent.change(screen.getByLabelText("Metric"), { target: { value: "log-visits" } });
    const legend = screen.getByLabelText("Log visits color range").textContent;
    fireEvent.click(screen.getByRole("checkbox", { name: /Left arm entries/ }));
    expect(state().left).toBe(false);
    expect(screen.getByLabelText("Log visits color range").textContent).toBe(legend);
    fireEvent.click(screen.getByRole("checkbox", { name: /Right arm entries/ }));
    expect(state().right).toBe(false);
    fireEvent.change(screen.getByLabelText("Metric"), { target: { value: "episodes" } });
    expect(screen.getByLabelText("Distinct episodes color range")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Metric"), { target: { value: "visits" } });
    expect(screen.getByLabelText("Visits color range")).toBeTruthy();
    expect(trajectoryRequests()).toHaveLength(0);
  });

  it("connects voxel selection, radius results, local scoring, spacing reset, and scene controls", async () => {
    await ready();
    fireEvent.click(screen.getByRole("button", { name: "Select test voxel" }));
    expect(screen.getByText(/Exact episode union:/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Query radius:/), { target: { value: "0" } });
    expect(screen.getByText("Radius: 0.000 m")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Episode scoring scope"), { target: { value: "radius" } });
    expect(screen.getByRole("list", { name: /ranking for selected radius/ })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Arm spacing (metres)"), { target: { value: "1.2" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply spacing" }));
    expect(state().spacing).toBe(1.2);
    expect(screen.queryByText(/Exact episode union:/)).toBeNull();
    expect(screen.getByRole("list", { name: /ranking for entire coverage/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restore manifest spacing" }));
    expect(state().spacing).toBe(0.8);
    fireEvent.click(screen.getByRole("checkbox", { name: "Auto rotate" }));
    expect(state().autoRotate).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Reset camera" }));
    expect(state().reset).toBe(1);
    expect(screen.getByText("10,248")).toBeTruthy();
  });

  it("shares an in-flight trajectory load and retains coverage-only evidence", async () => {
    await ready();
    let resolve!: (response: Response) => void;
    fetcher.mockImplementationOnce(() => new Promise<Response>((done) => { resolve = done; }));
    // A click on each activation control in the same batch must share one request.
    const load = screen.getByRole("button", { name: "Load playback" });
    const check = screen.getByRole("button", { name: "Check playback availability" });
    act(() => { load.click(); check.click(); });
    expect(trajectoryRequests()).toHaveLength(1);
    await act(async () => resolve(Response.json(trajectories)));
    expect(screen.getAllByText(/Coverage evidence only/)).toHaveLength(8);
    expect(screen.getByRole("button", { name: "Open Episode 1 playback" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Open Episode 9 playback" })).toBeNull();
  });

  it("retries trajectory failure without reloading coverage", async () => {
    await ready();
    fetcher.mockResolvedValueOnce(new Response(null, { status: 503 }));
    fireEvent.click(screen.getByRole("button", { name: "Load playback" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Unable to load trajectory payload");
    fireEvent.click(screen.getByRole("button", { name: "Retry playback availability" }));
    await screen.findByLabelText("Episode");
    expect(trajectoryRequests()).toHaveLength(2);
    expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith("coverage.json"))).toHaveLength(1);
  });

  it("uses explicit episode IDs and preserves speed, scrubbing, restart, and synchronized recorded samples", async () => {
    await ready();
    fetcher.mockResolvedValueOnce(Response.json({ ...trajectories, episodes: [...trajectories.episodes].reverse() }));
    fireEvent.click(screen.getByRole("button", { name: "Load playback" }));
    await screen.findByLabelText("Episode");
    expect(canvasProps.episode?.episodeId).toBe(1);
    fireEvent.change(screen.getByLabelText("Playback speed"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Loop playback" }));
    fireEvent.click(screen.getByRole("button", { name: "Open Episode 0 playback" }));
    expect(canvasProps.episode?.episodeId).toBe(0);
    expect((screen.getByLabelText("Playback speed") as HTMLSelectElement).value).toBe("2");
    expect((screen.getByRole("checkbox", { name: "Loop playback" }) as HTMLInputElement).checked).toBe(true);
    fireEvent.change(screen.getByLabelText("Timeline"), { target: { value: "12" } });
    expect(canvasProps.playbackFrame).toBe(12);
    expect(canvasProps.orientationEpisode?.episodeId).toBe(0);
    expect(canvasProps.recordedGripperEpisode?.leftRecordedGripperValues[12]).toBe(trajectories.episodes[0].leftRecordedGripperValues[12]);
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(canvasProps.playbackFrame).toBe(0);
    fireEvent.change(screen.getByLabelText("Episode"), { target: { value: "1" } });
    expect(canvasProps.episode?.episodeId).toBe(1);
    expect(canvasProps.orientationEpisode?.episodeId).toBe(1);
  });

  it("advances both arms using wall-clock elapsed time, manifest FPS, and selected speed", async () => {
    await ready();
    fireEvent.click(screen.getByRole("button", { name: "Load playback" }));
    await screen.findByLabelText("Timeline");
    let tick: FrameRequestCallback | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { tick = callback; return 1; });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    fireEvent.change(screen.getByLabelText("Playback speed"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    act(() => tick?.(1000));
    act(() => tick?.(1250));
    expect(canvasProps.playbackFrame).toBe(25);
    expect(screen.getByText(/Sample 26 of 515/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    expect(canvasProps.playbackFrame).toBe(25);
    await waitFor(() => expect(trajectoryRequests()).toHaveLength(1));
  });
});
