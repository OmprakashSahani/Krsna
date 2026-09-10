// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

"use client";

import styles from "./viewer.module.css";

import { useEffect, useRef, useState } from "react";

import type {
  EpisodeVideoPayload,
  TrajectoryPayload,
} from "@/lib/lerobot/atlas-schema/types";
import { metricDomain, metricLabels, type CoverageMetric } from "@/lib/lerobot/data/metrics";
import {
  episodeVideoAssetUrl,
  loadEpisodeVideos,
  loadTrajectories,
} from "@/lib/lerobot/data/loadBundle";
import { formatEpisodeSelection } from "@/lib/lerobot/data/episodeSelection";
import { queryRadius } from "@/lib/lerobot/data/radiusQuery";
import {
  advancePlayback,
  episodeVideoTime,
  formatPlaybackStatus,
  selectRecordedPlaybackSample,
  shouldSeekEpisodeVideo,
  type PlaybackState,
} from "@/lib/lerobot/playback/controller";
import { ViewerCanvas } from "./ViewerCanvas";
import { EnvironmentStatus } from "./EnvironmentStatus";
import {
  EpisodeAnalysisPanel,
  type TrajectoryState,
} from "./EpisodeAnalysisPanel";
import { useAtlasData } from "./AtlasDataProvider";
import { useViewerStore } from "./ViewerStore";

type EpisodeVideoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: EpisodeVideoPayload };

const metricDescriptions: Record<CoverageMetric, string> = {
  visits: "Raw arm-specific tool-point visits",
  "log-visits": "log1p of raw arm-specific visits",
  episodes: "Exact episodes represented by voxel CSR",
};

const MIN_ARM_SPACING = 0.2;
const MAX_ARM_SPACING = 1.4;

function formatMetric(value: number, metric: CoverageMetric) {
  return metric === "log-visits" ? value.toFixed(2) : value.toLocaleString();
}

export function AtlasViewer() {
  const atlas = useAtlasData();
  const viewer = useViewerStore();
  const [touchNavigation, setTouchNavigation] = useState(false);
  const [trajectories, setTrajectories] = useState<TrajectoryState>({
    status: "idle",
  });
  const [episodeId, setEpisodeId] = useState<number | null>(null);
  const [episodeVideos, setEpisodeVideos] = useState<EpisodeVideoState>({
    status: "idle",
  });
  const [mediaOpen, setMediaOpen] = useState(false);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [playback, setPlayback] = useState<PlaybackState>({
    frame: 0,
    playing: false,
    speed: 1,
    loop: false,
  });
  const previousTime = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaToggleRef = useRef<HTMLButtonElement>(null);
  const previousVideoSource = useRef<string | null>(null);
  const spacingInputRef = useRef<HTMLInputElement>(null);
  const episodeSelectorRef = useRef<HTMLSelectElement>(null);
  const playbackSectionRef = useRef<HTMLElement>(null);
  const trajectoryLoadRef = useRef<Promise<TrajectoryPayload> | null>(null);
  const episodeVideoLoadRef = useRef<Promise<EpisodeVideoPayload> | null>(null);
  const requestedEpisodeIdRef = useRef<number | null>(null);
  const [playbackFocusToken, setPlaybackFocusToken] = useState(0);

  useEffect(() => {
    if (atlas.status === "ready" && viewer.spacing === 0.8) {
      viewer.setSpacing(atlas.data.manifest.coverage.armSpacing);
    }
    // Initialize once from the exported baseline; runtime changes are user-owned.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atlas.status]);

  const selectLoadedPlaybackEpisode = (
    data: TrajectoryPayload,
    requestedEpisodeId?: number,
  ) => {
    const requestedEpisode =
      requestedEpisodeId === undefined
        ? undefined
        : data.episodes.find(
            (candidate) => candidate.episodeId === requestedEpisodeId,
          );
    const selectedEpisode = requestedEpisode ?? data.episodes[0];
    setEpisodeId(selectedEpisode.episodeId);
    setPlayback((state) => ({ ...state, frame: 0, playing: false }));
    if (requestedEpisode !== undefined) {
      setPlaybackFocusToken((token) => token + 1);
    }
  };

  const activatePlayback = (requestedEpisodeId?: number) => {
    if (atlas.status !== "ready") return;
    if (trajectories.status === "ready") {
      selectLoadedPlaybackEpisode(trajectories.data, requestedEpisodeId);
      return;
    }
    if (
      requestedEpisodeId !== undefined &&
      requestedEpisodeIdRef.current === null
    ) {
      requestedEpisodeIdRef.current = requestedEpisodeId;
    }
    if (trajectoryLoadRef.current !== null) return;
    setTrajectories({ status: "loading" });
    const request = loadTrajectories(atlas.data.manifest);
    trajectoryLoadRef.current = request;
    request.then(
      (data) => {
        const requestedEpisode = requestedEpisodeIdRef.current;
        requestedEpisodeIdRef.current = null;
        setTrajectories({ status: "ready", data });
        selectLoadedPlaybackEpisode(
          data,
          requestedEpisode === null ? undefined : requestedEpisode,
        );
      },
      (error: unknown) => {
        trajectoryLoadRef.current = null;
        requestedEpisodeIdRef.current = null;
        setTrajectories({
          status: "error",
          message: error instanceof Error ? error.message : "Trajectory playback failed to load.",
        });
      },
    );
  };

  const loadEpisodeVideoMetadata = () => {
    if (atlas.status !== "ready") return;
    if (episodeVideos.status === "ready") return;
    if (episodeVideoLoadRef.current !== null) return;
    setEpisodeVideos({ status: "loading" });
    const request = loadEpisodeVideos(atlas.data.manifest);
    episodeVideoLoadRef.current = request;
    request.then(
      (videoData) => {
        episodeVideoLoadRef.current = null;
        setEpisodeVideos({ status: "ready", data: videoData });
        setCameraId((current) => current ?? videoData.defaultCameraId);
      },
      (error: unknown) => {
        episodeVideoLoadRef.current = null;
        setEpisodeVideos({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Synchronized episode video failed to load.",
        });
      },
    );
  };

  const openMedia = () => {
    setMediaOpen(true);
    if (hasEpisodeVideos && episodeVideos.status === "idle") {
      loadEpisodeVideoMetadata();
    }
  };

  const closeMedia = () => {
    setMediaOpen(false);
    window.requestAnimationFrame(() => mediaToggleRef.current?.focus());
  };

  const episode =
    trajectories.status === "ready"
      ? trajectories.data.episodes.find((item) => item.episodeId === episodeId) ?? null
      : null;
  const orientationEpisode =
    trajectories.status === "ready" &&
    trajectories.data.orientation.status === "available"
      ? trajectories.data.orientation.data.episodes.find(
          (item) => item.episodeId === episodeId,
        ) ?? null
      : null;
  const recordedGripperEpisode =
    trajectories.status === "ready" &&
    trajectories.data.gripper.status === "available"
      ? trajectories.data.gripper.data.episodes.find(
          (item) => item.episodeId === episodeId,
        ) ?? null
      : null;
  const recordedSample = episode
    ? selectRecordedPlaybackSample(
        episode,
        playback.frame,
        orientationEpisode ?? undefined,
        recordedGripperEpisode ?? undefined,
      )
    : null;
  const videoEpisode =
    episodeVideos.status === "ready"
      ? episodeVideos.data.episodes.find(
          (item) => item.episodeId === episodeId,
        ) ?? null
      : null;
  const videoSource =
    videoEpisode?.videos.find((item) => item.cameraId === cameraId) ?? null;
  const videoCamera =
    episodeVideos.status === "ready"
      ? episodeVideos.data.cameras.find((item) => item.cameraId === cameraId) ??
        null
      : null;

  useEffect(() => {
    if (playbackFocusToken === 0) return;
    episodeSelectorRef.current?.focus();
    playbackSectionRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [playbackFocusToken]);

  useEffect(() => {
    if (!playback.playing || !episode || atlas.status !== "ready") {
      previousTime.current = null;
      return;
    }
    let animationFrame = 0;
    const tick = (now: number) => {
      const previous = previousTime.current ?? now;
      previousTime.current = now;
      setPlayback((state) =>
        advancePlayback(
          state,
          (now - previous) / 1000,
          atlas.data.manifest.dataset.fps,
          episode.frameIndices.length,
        ),
      );
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [atlas, episode, playback.playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !episode || !videoSource) return;

    const sourceChanged = previousVideoSource.current !== videoSource.filename;
    previousVideoSource.current = videoSource.filename;
    video.playbackRate = playback.speed;
    const targetTime = episodeVideoTime(episode, videoSource, playback.frame);
    if (
      shouldSeekEpisodeVideo(
        video.currentTime,
        targetTime,
        sourceChanged || !playback.playing,
      )
    ) {
      video.currentTime = targetTime;
    }

    if (!playback.playing) {
      video.pause();
      return;
    }

    try {
      const playResult = video.play();
      playResult?.catch(() => {
        // Autoplay policy can reject play(); atlas playback remains authoritative.
      });
    } catch {
      // Media support and autoplay failures must not break trajectory controls.
    }
  }, [
    episode,
    mediaOpen,
    playback.frame,
    playback.playing,
    playback.speed,
    videoSource,
  ]);

  if (atlas.status === "loading") {
    return <div className={styles["viewer-status"]} role="status">Loading pinned atlas data…</div>;
  }
  if (atlas.status === "error") {
    return (
      <section className={styles["viewer-fallback"]} role="alert">
        <p className={styles["eyebrow"]}>Data load failed</p>
        <h2>The demo bundle could not be opened.</h2>
        <p>{atlas.message}</p>
        <button className={styles["button"] + " " + styles["button-secondary"]} onClick={() => window.location.reload()} type="button">Retry</button>
      </section>
    );
  }

  const { manifest, preparedArms, coverage } = atlas.data;
  const hasEpisodeVideos = manifest.payloads.some(
    (payload) => payload.kind === "episode-videos",
  );
  const domain = metricDomain(preparedArms, viewer.metric);
  const radiusResult = viewer.selection
    ? queryRadius(
        preparedArms,
        coverage,
        viewer.selection,
        viewer.radius,
        viewer.spacing,
        manifest.coverage.armSpacing,
      )
    : null;
  const selectedCoverage = viewer.selection
    ? coverage.arms[viewer.selection.arm === "left" ? 0 : 1]
    : null;
  const selectedVisits =
    viewer.selection && selectedCoverage
      ? selectedCoverage.visitCounts[viewer.selection.voxelEntryIndex]
      : 0;
  const selectedEpisodes =
    viewer.selection && selectedCoverage
      ? selectedCoverage.episodeIdOffsets[viewer.selection.voxelEntryIndex + 1] -
        selectedCoverage.episodeIdOffsets[viewer.selection.voxelEntryIndex]
      : 0;
  const frameIndex = recordedSample?.index ?? 0;
  const episodeSelectionLabel = formatEpisodeSelection(
    manifest.dataset.episodeIds,
    manifest.dataset.episodeCount,
  );

  const commitSpacingInput = () => {
    const input = spacingInputRef.current;
    const rawSpacing = input?.value.trim() ?? "";
    const parsedSpacing = rawSpacing === "" ? Number.NaN : Number(rawSpacing);

    if (!input || !Number.isFinite(parsedSpacing)) {
      if (input) input.value = viewer.spacing.toFixed(2);
      return;
    }

    const boundedSpacing = Math.min(
      MAX_ARM_SPACING,
      Math.max(MIN_ARM_SPACING, parsedSpacing),
    );

    input.value = boundedSpacing.toFixed(2);
    viewer.setSpacing(boundedSpacing);
  };

  return (
    <div className={styles["viewer-shell"]}>
      <section className={styles["interactive-workspace"]} aria-label="Workspace interaction">
        <div
          className={styles["viewer-visuals"]}
          data-testid="viewer-visuals"
        >
          <section className={styles["viewer-stage"]} aria-label="Interactive workspace scene">
            <div className={styles["canvas-surface"]} data-touch-navigation={touchNavigation}>
              <ViewerCanvas
                data={atlas.data}
                episode={episode}
                orientationEpisode={orientationEpisode}
                recordedGripperEpisode={recordedGripperEpisode}
                playbackFrame={playback.frame}
                touchNavigation={touchNavigation}
              />
            </div>
            <div className={styles["scene-badge"]}>Canonical shared world</div>
          </section>
          <div className={styles["scene-help"]}>
            <p>Click a voxel to query · Drag to orbit · Right-drag to pan · Scroll to zoom</p>
            <button type="button" className={styles["compact-button"]} aria-pressed={touchNavigation} aria-describedby="touch-navigation-help" onClick={() => setTouchNavigation((enabled) => !enabled)}>Touch navigation</button>
            <p id="touch-navigation-help">{touchNavigation ? "Touch navigation on: drag to orbit; use two fingers to pan or zoom. Turn off to scroll the page over the scene." : "Touch navigation off: swipe over the scene to scroll the page. Enable to orbit, pan and zoom with touch."}</p>
          </div>
        </div>
        <aside className={styles["viewer-panel"]} aria-label="Viewer controls">
          <div className={styles["panel-heading"]}>
            <div><p className={styles["eyebrow"]}>{manifest.bundleId} / {episodeSelectionLabel}</p><h2>Workspace coverage</h2></div>
            <span className={styles["schema-chip"]}>
              schema v{manifest.schema.major}.{manifest.schema.minor}
            </span>
          </div>

          <section className={styles["control-section"]} aria-labelledby="metric-heading">
            <div className={styles["section-title-row"]}><h3 id="metric-heading">Coverage metric</h3><span>{metricLabels[viewer.metric]}</span></div>
            <label className={styles["field-label"]} htmlFor="coverage-metric">Metric</label>
            <select
              id="coverage-metric"
              value={viewer.metric}
              onChange={(event) => viewer.setMetric(event.target.value as CoverageMetric)}
            >
              <option value="visits">Visits</option>
              <option value="log-visits">Log visits</option>
              <option value="episodes">Distinct episodes</option>
            </select>
            <small className={styles["control-help"]}>{metricDescriptions[viewer.metric]}</small>
            <div className={styles["legend"]} aria-label={`${metricLabels[viewer.metric]} color range`}>
              <div className={styles["legend-swatches"]} aria-hidden="true"><i /><i /><i /><i /></div>
              <div><span>{formatMetric(domain[0], viewer.metric)}</span><span>{formatMetric(domain[1], viewer.metric)}</span></div>
            </div>
          </section>

          <section className={styles["control-section"]} aria-labelledby="scene-heading">
            <div className={styles["section-title-row"]}><h3 id="scene-heading">Scene</h3><button className={styles["compact-button"]} type="button" onClick={viewer.resetCamera}>Reset camera</button></div>
            <label className={styles["layer-toggle"]}><input checked={viewer.leftVisible} onChange={() => viewer.toggleArm("left")} type="checkbox" /><span className={styles["arm-dot"] + " " + styles["arm-dot-left"]} aria-hidden="true" />Left arm entries<strong>{preparedArms[0].visits.length.toLocaleString()}</strong></label>
            <label className={styles["layer-toggle"]}><input checked={viewer.rightVisible} onChange={() => viewer.toggleArm("right")} type="checkbox" /><span className={styles["arm-dot"] + " " + styles["arm-dot-right"]} aria-hidden="true" />Right arm entries<strong>{preparedArms[1].visits.length.toLocaleString()}</strong></label>
            <label className={styles["layer-toggle"] + " " + styles["simple-toggle"]}><input checked={viewer.autoRotate} onChange={(event) => viewer.setAutoRotate(event.target.checked)} type="checkbox" />Auto rotate</label>
          </section>


          <section className={styles["control-section"] + " " + styles["robot-setup"]} aria-labelledby="robot-setup-heading">
            <div className={styles["section-title-row"]}><h2 id="robot-setup-heading">Robot setup</h2><span>Provisional geometry</span></div>
            <p className={styles["control-help"]}>
              Distance between the left and right arm bases in the shared world.
              Both arms move symmetrically when this value changes.
            </p>

            <div className={styles["spacing-current"]} aria-live="polite">
              <span>Current shared-world spacing</span>
              <strong>{viewer.spacing.toFixed(2)} m</strong>
            </div>

            <form
              className={styles["spacing-form"]}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                commitSpacingInput();
              }}
            >
              <label className={styles["field-label"]} htmlFor="arm-spacing-number">
                Arm spacing (metres)
              </label>
              <div className={styles["spacing-input-row"]}>
                <input
                  aria-describedby="arm-spacing-help"
                  defaultValue={viewer.spacing.toFixed(2)}
                  id="arm-spacing-number"
                  inputMode="decimal"
                  key={`arm-spacing-${viewer.spacing.toFixed(2)}`}
                  max={MAX_ARM_SPACING}
                  min={MIN_ARM_SPACING}
                  onBlur={commitSpacingInput}
                  ref={spacingInputRef}
                  step="0.01"
                  type="number"
                />
                <button className={styles["compact-button"]} type="submit">
                  Apply spacing
                </button>
              </div>
            </form>

            <label className={styles["field-label"]} htmlFor="arm-spacing-slider">
              Arm spacing slider: {viewer.spacing.toFixed(2)} m
            </label>
            <input
              id="arm-spacing-slider"
              max={MAX_ARM_SPACING}
              min={MIN_ARM_SPACING}
              onChange={(event) => viewer.setSpacing(Number(event.target.value))}
              step="0.02"
              type="range"
              value={viewer.spacing}
            />

            <small className={styles["control-help"]} id="arm-spacing-help">
              Allowed range: {MIN_ARM_SPACING.toFixed(2)}–{MAX_ARM_SPACING.toFixed(2)} m.
              This changes only the runtime shared-world transform.
            </small>

            <div className={styles["spacing-actions"]}>
              <button
                className={styles["compact-button"]}
                type="button"
                onClick={() => viewer.setSpacing(manifest.coverage.armSpacing)}
              >
                Restore manifest spacing
              </button>
              <small>Manifest baseline: {manifest.coverage.armSpacing.toFixed(2)} m</small>
            </div>
          </section>


          <section className={styles["control-section"]} aria-labelledby="query-heading">
            <div className={styles["section-title-row"]}><h2 id="query-heading">Radius query</h2>{viewer.selection ? <button className={styles["compact-button"]} type="button" onClick={viewer.clearSelection}>Clear selection</button> : null}</div>
            <label className={styles["field-label"]} htmlFor="query-radius">Query radius: {viewer.radius.toFixed(3)} m</label>
            <input id="query-radius" type="range" min="0" max="0.3" step="0.005" value={viewer.radius} onChange={(event) => viewer.setRadius(Number(event.target.value))} />
            {radiusResult ? (
              <div className={styles["query-result"]} role="status" aria-live="polite">
                <strong>{radiusResult.selectedArm} arm voxel selected</strong>
                <span>Center: {radiusResult.center.map((value) => value.toFixed(3)).join(", ")} m</span>
                <span>Radius: {radiusResult.radius.toFixed(3)} m</span>
                <span>Arm-specific entries: {radiusResult.entryCount.toLocaleString()}</span>
                <span>Tool-point visits: {radiusResult.toolPointVisits.toLocaleString()}</span>
                <span>Left / right visits: {radiusResult.leftVisits.toLocaleString()} / {radiusResult.rightVisits.toLocaleString()}</span>
                <span>Exact episode union: {radiusResult.distinctEpisodeCount.toLocaleString()}</span>
                <span>Selected voxel: {selectedVisits.toLocaleString()} raw visits · {selectedEpisodes.toLocaleString()} exact episodes</span>
              </div>
            ) : <p className={styles["control-help"]}>Select an occupied voxel in the scene.</p>}
          </section>

          <section className={styles["control-section"]} aria-labelledby="playback-heading" ref={playbackSectionRef}>
            <div className={styles["section-title-row"]}><h2 id="playback-heading">Trajectory playback</h2><span>Optional payload</span></div>
            <div className={styles["playback-primary-actions"]}>
              <button
                aria-controls="synchronized-media-panel"
                aria-expanded={mediaOpen}
                className={styles["compact-button"] + " " + styles["playback-primary-action"]}
                onClick={mediaOpen ? closeMedia : openMedia}
                ref={mediaToggleRef}
                type="button"
              >
                {mediaOpen
                  ? "Close synchronized media"
                  : "Open synchronized media"}
              </button>
              {trajectories.status === "idle" ? (
                <button
                  className={styles["compact-button"] + " " + styles["playback-primary-action"]}
                  type="button"
                  onClick={() => activatePlayback()}
                >
                  Load playback
                </button>
              ) : null}
            </div>
          {mediaOpen ? (
          <section
            aria-label="Synchronized media"
            className={styles["episode-video-panel"]}
            id="synchronized-media-panel"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeMedia();
            }}
          >
            <div className={styles["episode-video-heading"]}>
              <div>
                <p className={styles["eyebrow"]}>Synchronized media</p>
                <h3 id="episode-video-heading">Episode video</h3>
              </div>
              {episodeVideos.status === "ready" &&
              episodeVideos.data.cameras.length > 1 ? (
                <div className={styles["episode-video-camera"]}>
                  <label htmlFor="video-camera">Camera</label>
                  <select
                    id="video-camera"
                    value={cameraId ?? ""}
                    onChange={(event) => setCameraId(event.target.value)}
                  >
                    {episodeVideos.data.cameras.map((camera) => (
                      <option key={camera.cameraId} value={camera.cameraId}>
                        {camera.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
            {!hasEpisodeVideos ? (
              <p className={styles["episode-video-message"]} role="note">
                Synchronized media is not included in this bundle.
              </p>
            ) : null}
            {hasEpisodeVideos && episodeVideos.status === "loading" ? (
              <p className={styles["episode-video-message"]} role="status">
                Loading synchronized video metadata…
              </p>
            ) : null}
            {hasEpisodeVideos && episodeVideos.status === "error" ? (
              <p className={styles["episode-video-message"]} role="note">
                Synchronized episode video is unavailable. {episodeVideos.message}
              </p>
            ) : null}
            {hasEpisodeVideos && episodeVideos.status === "error" ? (
              <button
                className={styles["compact-button"] + " " + styles["episode-video-retry"]}
                onClick={loadEpisodeVideoMetadata}
                type="button"
              >
                Retry synchronized media
              </button>
            ) : null}
            {hasEpisodeVideos && episodeVideos.status === "ready" && !episode ? (
              <p className={styles["episode-video-message"]} role="note">
                Load trajectory playback to select synchronized episode media.
              </p>
            ) : null}
            {hasEpisodeVideos &&
            episodeVideos.status === "ready" &&
            episode &&
            !videoSource ? (
              <p className={styles["episode-video-message"]} role="note">
                No synchronized {videoCamera?.label.toLowerCase() ?? "camera"} video
                is available for this episode.
              </p>
            ) : null}
            {hasEpisodeVideos && videoSource && videoCamera ? (
              <video
                aria-label={`${videoCamera.label} synchronized episode video`}
                key={videoSource.filename}
                playsInline
                preload="metadata"
                ref={videoRef}
                src={episodeVideoAssetUrl(videoSource.filename)}
              />
            ) : null}
          </section>
          ) : null}
            {trajectories.status === "loading" ? <p role="status">Loading trajectories…</p> : null}
            {trajectories.status === "error" ? <p role="alert">{trajectories.message}</p> : null}
            {trajectories.status === "ready" && episode ? (
              <div className={styles["playback-controls"]}>
                <label className={styles["field-label"]} htmlFor="episode-selector">Episode</label>
                <select ref={episodeSelectorRef} id="episode-selector" value={episode.episodeId} onChange={(event) => { setEpisodeId(Number(event.target.value)); setPlayback((state) => ({ ...state, frame: 0, playing: false })); }}>
                  {trajectories.data.episodes.map((item) => <option key={item.episodeId} value={item.episodeId}>Episode {item.episodeId}</option>)}
                </select>
                <div className={styles["button-row"]}>
                  <button className={styles["compact-button"]} type="button" aria-pressed={playback.playing} onClick={() => setPlayback((state) => ({ ...state, playing: !state.playing }))}>{playback.playing ? "Pause" : "Play"}</button>
                  <button className={styles["compact-button"]} type="button" onClick={() => setPlayback((state) => ({ ...state, frame: 0, playing: false }))}>Restart</button>
                </div>
                <label className={styles["field-label"]} htmlFor="playback-timeline">Timeline</label>
                <input id="playback-timeline" type="range" min="0" max={episode.frameIndices.length - 1} step="1" value={frameIndex} onChange={(event) => setPlayback((state) => ({ ...state, frame: Number(event.target.value), playing: false }))} />
                <span className={styles["playback-status"]}>
                  {formatPlaybackStatus(episode, playback.frame)}
                </span>
                {recordedSample?.left.recordedGripperValue !== undefined ||
                recordedSample?.right.recordedGripperValue !== undefined ? (
                  <div
                    aria-label="Recorded raw gripper values"
                    className={styles["raw-gripper-readout"]}
                    role="group"
                  >
                    <dl>
                      {recordedSample.left.recordedGripperValue !== undefined ? (
                        <div>
                          <dt>Left raw value</dt>
                          <dd>
                            {String(recordedSample.left.recordedGripperValue)}
                          </dd>
                        </div>
                      ) : null}
                      {recordedSample.right.recordedGripperValue !== undefined ? (
                        <div>
                          <dt>Right raw value</dt>
                          <dd>
                            {String(recordedSample.right.recordedGripperValue)}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                    <p>
                      Symbolic display only. Values are raw and device-specific;
                      physical jaw width is not calibrated, and open/closed
                      polarity is not established.
                    </p>
                  </div>
                ) : null}
                {trajectories.data.gripper.status === "degraded" ? (
                  <p className={styles["playback-capability-note"]} role="note">
                    {trajectories.data.gripper.warning}
                  </p>
                ) : null}
                <label className={styles["field-label"]} htmlFor="playback-speed">Playback speed</label>
                <select id="playback-speed" value={playback.speed} onChange={(event) => setPlayback((state) => ({ ...state, speed: Number(event.target.value) }))}>
                  <option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option>
                </select>
                <label className={styles["layer-toggle"] + " " + styles["simple-toggle"]}><input type="checkbox" checked={playback.loop} onChange={(event) => setPlayback((state) => ({ ...state, loop: event.target.checked }))} />Loop playback</label>
              </div>
            ) : null}
          </section>


        </aside>
      </section>
      <div className={styles["dataset-notes"]}>
        <section className={styles["control-section"] + " " + styles["metadata-grid"]} aria-label="Dataset metadata">
          <div><span>Dataset frames</span><strong>{manifest.totals.datasetFrameCount.toLocaleString()}</strong></div>
          <div><span>Tool-point visits</span><strong>{manifest.totals.toolPointVisitCount.toLocaleString()}</strong></div>
          <div><span>Arm voxel entries</span><strong>{manifest.totals.armVoxelEntryCount.toLocaleString()}</strong></div>
          <div><span>Shared grid cells</span><strong>{manifest.totals.uniqueSharedGridCellCount.toLocaleString()}</strong></div>
        </section>
        <section className={styles["control-section"] + " " + styles["detail-list"]} aria-label="Coordinate metadata">
          <div><span>Dataset</span><strong>{manifest.dataset.repositoryId}</strong></div><div><span>Robot</span><strong>{manifest.robot.modelName}</strong></div><div><span>Voxel edge</span><strong>{manifest.coverage.voxelSize.toFixed(2)} m</strong></div><div><span>Frame</span><strong>Right-handed · metres</strong></div>
        </section>
        <section className={styles["control-section"] + " " + styles["detail-list"]} aria-label="Data provenance">
          <div><span>Requested dataset ref</span><strong>{manifest.dataset.requestedRevision}</strong></div><div><span>Resolved HF commit</span><strong title={manifest.dataset.resolvedRevision}>{manifest.dataset.resolvedRevision.slice(0, 12)}…</strong></div><div><span>LeRobot metadata</span><strong>{manifest.dataset.lerobotCodebaseVersion}</strong></div><div><span>LeRobot package</span><strong>{manifest.dataset.lerobotPackageVersion}</strong></div><div><span>Repository HEAD</span><strong title={manifest.exporter.repositoryHeadCommit}>{manifest.exporter.repositoryHeadCommit.slice(0, 12)}…</strong></div>
        </section>
        {manifest.exporter.workingTreeDirty ? <div className={styles["source-warning"]} role="note"><strong>Uncommitted exporter source</strong><p>{manifest.exporter.sourceDescription}</p></div> : null}
        <div className={styles["spacing-warning"]} role="note"><strong>Provisional geometry</strong><p>{manifest.coverage.spacingDisclosure}</p></div>
          <EnvironmentStatus />
      </div>
      <EpisodeAnalysisPanel
        coverage={coverage}
        episodeCount={manifest.dataset.episodeCount}
        episodeIds={manifest.dataset.episodeIds}
        radiusResult={radiusResult}
        selection={viewer.selection}
        trajectories={trajectories}
        onCheckPlayback={() => activatePlayback()}
        onOpenPlayback={activatePlayback}
      />
    </div>
  );
}
