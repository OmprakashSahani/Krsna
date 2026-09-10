import { afterEach, describe, expect, it, vi } from "vitest";
import manifestJson from "../../../../public/lerobot-state-atlas/demo-v2/manifest.json";
import coverageJson from "../../../../public/lerobot-state-atlas/demo-v2/coverage.json";
import trajectoriesJson from "../../../../public/lerobot-state-atlas/demo-v2/trajectories.json";
import { decodeManifest } from "../atlas-schema/validate";
import { episodeVideoAssetUrl, loadDemoBundle, loadEpisodeVideos, loadTrajectories, resolveBundleBase } from "../data/loadBundle";

afterEach(() => vi.unstubAllEnvs());

describe("Krsna bundle loading contract", () => {
  it.each([
    "/atlas-data/demo-v2", "/lerobot-state-atlas/", "/lerobot-state-atlas/demo-v2//",
    "/lerobot-state-atlas/./demo-v2", "/lerobot-state-atlas/%2e%2e/private",
    "/lerobot-state-atlas/demo-v2\n", "/lerobot-state-atlas-other/demo-v2",
  ])("rejects namespace or normalization escape %j", (base) => {
    expect(() => resolveBundleBase(base)).toThrow(/safe root-relative/);
  });

  it("waits for a valid manifest before fetching coverage and never requests trajectories eagerly", async () => {
    let finishManifest!: (response: Response) => void;
    const pendingManifest = new Promise<Response>((resolve) => { finishManifest = resolve; });
    const fetcher = vi.fn<typeof fetch>()
      .mockReturnValueOnce(pendingManifest)
      .mockResolvedValueOnce(Response.json(coverageJson))
      .mockResolvedValueOnce(Response.json(trajectoriesJson));
    const pending = loadDemoBundle(fetcher, "production");
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual(["/lerobot-state-atlas/demo-v2/manifest.json"]);
    finishManifest(Response.json(manifestJson));
    const bundle = await pending;
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "/lerobot-state-atlas/demo-v2/manifest.json", "/lerobot-state-atlas/demo-v2/coverage.json",
    ]);
    await loadTrajectories(bundle.manifest, fetcher, "production");
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "/lerobot-state-atlas/demo-v2/manifest.json", "/lerobot-state-atlas/demo-v2/coverage.json",
      "/lerobot-state-atlas/demo-v2/trajectories.json",
    ]);
  });

  it.each([
    "https://example.com/payload.json", "//example.com/payload.json", "/private.json",
    "../private.json", "nested/../../private.json", "nested/./payload.json",
    "nested//payload.json", "nested\\payload.json", "%2e%2e/private.json",
    "payload.json?url=external", "payload.json#fragment", "..\n/private.json", "",
  ])("rejects unsafe payload and media path %j before fetching it", async (filename) => {
    const raw = structuredClone(manifestJson);
    raw.payloads[0].filename = filename;
    const coverageFetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(raw));
    await expect(loadDemoBundle(coverageFetcher)).rejects.toThrow();
    expect(coverageFetcher).toHaveBeenCalledTimes(1);

    const manifest = decodeManifest(manifestJson);
    manifest.payloads.find((payload) => payload.kind === "trajectories")!.filename = filename;
    manifest.payloads.push({ kind: "episode-videos", filename, required: false, encoding: "json", byteSize: 1, sha256: "a".repeat(64) });
    const fetcher = vi.fn<typeof fetch>();
    await expect(loadTrajectories(manifest, fetcher)).rejects.toThrow(/bundle-relative/);
    await expect(loadEpisodeVideos(manifest, fetcher)).rejects.toThrow(/bundle-relative/);
    expect(fetcher).not.toHaveBeenCalled();
    expect(() => episodeVideoAssetUrl(filename)).toThrow(/bundle-relative/);
  });

  it("resolves nested optional assets inside the selected bundle", async () => {
    vi.stubEnv("NEXT_PUBLIC_ATLAS_BUNDLE_BASE", "/lerobot-state-atlas/future-bundle/");
    expect(episodeVideoAssetUrl("media/episode-000009/top.mp4")).toBe("/lerobot-state-atlas/future-bundle/media/episode-000009/top.mp4");
    const manifest = decodeManifest(manifestJson);
    manifest.payloads.find((payload) => payload.kind === "trajectories")!.filename = "payloads/trajectories.json";
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(trajectoriesJson));
    await loadTrajectories(manifest, fetcher, "production");
    expect(fetcher).toHaveBeenCalledWith("/lerobot-state-atlas/future-bundle/payloads/trajectories.json", undefined);
  });

  it("rejects invalid manifest JSON without making additional requests", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("{"));
    await expect(loadDemoBundle(fetcher)).rejects.toThrow(/not valid JSON/);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("keeps absent video and trajectory capabilities request-free", async () => {
    const manifest = decodeManifest(manifestJson);
    const fetcher = vi.fn<typeof fetch>();
    await expect(loadEpisodeVideos(manifest, fetcher)).rejects.toThrow(/does not include synchronized episode video/);
    manifest.payloads = manifest.payloads.filter((payload) => payload.kind !== "trajectories");
    await expect(loadTrajectories(manifest, fetcher)).rejects.toThrow(/does not include trajectory playback/);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
